<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Group;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Models\Venue;
use InvalidArgumentException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class WorldCupMatchSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array<string, array{fifa_code: string, country_code: string}> $teamAssets */
        $teamAssets = require database_path('seeders/Data/team_assets.php');

        $payload = json_decode(
            File::get(database_path('data/world_cup_2026_matches.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        TournamentMatch::query()->delete();
        Venue::query()->delete();
        Team::query()->delete();
        Group::query()->delete();
        City::query()->delete();

        $groups = collect($payload['matches'])
            ->pluck('group_name')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->map(function (string $groupName, int $index) {
                return Group::query()->create([
                    'code' => str_replace('Group ', '', $groupName),
                    'name' => $groupName,
                    'display_order' => $index + 1,
                ]);
            })
            ->keyBy('name');

        $cities = collect($payload['venues'])
            ->unique(fn (array $venue) => $venue['city'].'|'.$venue['country'])
            ->values()
            ->map(function (array $venue, int $index) {
                return City::query()->create([
                    'name' => $venue['city'],
                    'country' => $venue['country'],
                    'timezone_name' => $venue['timezone_name'],
                    'display_order' => $index + 1,
                ]);
            })
            ->keyBy(fn (City $city) => $city->name.'|'.$city->country);

        $venues = collect($payload['venues'])
            ->values()
            ->map(function (array $venue, int $index) use ($cities) {
                $city = $cities[$venue['city'].'|'.$venue['country']];

                return Venue::query()->create([
                    'city_id' => $city->id,
                    'host_market' => $venue['host_market'],
                    'stadium_name' => $venue['stadium_name'],
                    'display_order' => $index + 1,
                ]);
            })
            ->keyBy('host_market');

        $teams = collect($payload['matches'])
            ->filter(fn (array $match) => $match['stage'] === 'Group Stage')
            ->flatMap(function (array $match) use ($groups) {
                $group = $groups[$match['group_name']];

                return [
                    [
                        'group_id' => $group->id,
                        'name' => $match['home_team_name'],
                        'group_slot' => $match['home_team_slot'],
                    ],
                    [
                        'group_id' => $group->id,
                        'name' => $match['away_team_name'],
                        'group_slot' => $match['away_team_slot'],
                    ],
                ];
            })
            ->unique('name')
            ->values()
            ->map(function (array $team, int $index) use ($teamAssets) {
                $asset = $teamAssets[$team['name']] ?? null;

                if (! $asset) {
                    throw new InvalidArgumentException(sprintf('Missing team asset metadata for "%s".', $team['name']));
                }

                return Team::query()->create([
                    'group_id' => $team['group_id'],
                    'name' => $team['name'],
                    'fifa_code' => $asset['fifa_code'],
                    'country_code' => $asset['country_code'],
                    'group_slot' => $team['group_slot'],
                    'display_order' => $index + 1,
                    'image_url' => $this->flagImageUrl($asset['country_code']),
                ]);
            })
            ->keyBy('name');

        foreach ($payload['matches'] as $match) {
            $group = $match['group_name'] ? $groups[$match['group_name']] : null;
            $homeTeam = $teams->get($match['home_team_name']);
            $awayTeam = $teams->get($match['away_team_name']);

            TournamentMatch::query()->create([
                'fifa_match_number' => $match['fifa_match_number'],
                'stage' => $match['stage'],
                'group_name' => $match['group_name'],
                'group_id' => $group?->id,
                'match_date' => $match['match_date'],
                'kickoff_at_local' => $match['kickoff_at_local'],
                'timezone_name' => $match['timezone_name'],
                'kickoff_at_utc' => $match['kickoff_at_utc'],
                'venue_id' => $venues[$match['venue_host_market']]->id,
                'home_team_id' => $homeTeam?->id,
                'away_team_id' => $awayTeam?->id,
                'home_team_name' => $match['home_team_name'],
                'away_team_name' => $match['away_team_name'],
                'home_team_slot' => $match['home_team_slot'],
                'away_team_slot' => $match['away_team_slot'],
                'status' => 'scheduled',
                'round_order' => $match['round_order'],
                'match_order' => $match['match_order'],
            ]);
        }
    }

    protected function flagImageUrl(string $countryCode): string
    {
        return sprintf(
            'https://cdn.jsdelivr.net/npm/flag-icons/flags/4x3/%s.svg',
            strtolower($countryCode),
        );
    }
}
