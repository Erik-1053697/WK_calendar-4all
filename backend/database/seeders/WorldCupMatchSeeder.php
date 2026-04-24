<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Group;
use App\Models\LeaderboardEntry;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\Venue;
use InvalidArgumentException;
use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class WorldCupMatchSeeder extends Seeder
{
    private const DISPLAY_TIMEZONE = 'Europe/Amsterdam';

    public function run(): void
    {
        /** @var array<string, array{fifa_code: string, country_code: string}> $teamAssets */
        $teamAssets = require database_path('seeders/Data/team_assets.php');

        $payload = json_decode(
            File::get(database_path('data/world_cup_2026_matches.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        LeaderboardEntry::query()->delete();
        Standing::query()->delete();
        DB::table('group_teams')->delete();
        Prediction::query()->delete();
        TournamentMatch::query()->delete();
        Venue::query()->delete();
        Team::query()->delete();
        Group::query()->delete();
        City::query()->delete();
        Tournament::query()->delete();

        $tournament = Tournament::query()->create([
            'name' => 'World Championship',
            'year' => 2026,
            'start_date' => '2026-06-11',
            'end_date' => '2026-07-19',
            'status' => 'upcoming',
        ]);

        $groups = collect($payload['matches'])
            ->pluck('group_name')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->map(function (string $groupName, int $index) use ($tournament) {
                return Group::query()->create([
                    'tournament_id' => $tournament->id,
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
            ->map(function (array $venue, int $index) use ($cities, $tournament) {
                $city = $cities[$venue['city'].'|'.$venue['country']];

                return Venue::query()->create([
                    'tournament_id' => $tournament->id,
                    'city_id' => $city->id,
                    'host_market' => $venue['host_market'],
                    'stadium_name' => $venue['stadium_name'],
                    'capacity' => $this->capacityFor($venue['host_market']),
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
                    'code' => $asset['fifa_code'],
                    'fifa_code' => $asset['fifa_code'],
                    'country_code' => $asset['country_code'],
                    'group_slot' => $team['group_slot'],
                    'display_order' => $index + 1,
                    'image_url' => $this->flagImageUrl($asset['country_code']),
                    'flag_url' => $this->flagImageUrl($asset['country_code']),
                    'confederation' => $this->confederationFor($asset['country_code']),
                ]);
            })
            ->keyBy('name');

        $teams->each(function (Team $team): void {
            if (! $team->group_id) {
                return;
            }

            DB::table('group_teams')->updateOrInsert(
                [
                    'group_id' => $team->group_id,
                    'team_id' => $team->id,
                ],
                [
                    'sort_order' => $team->display_order,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );

            Standing::query()->updateOrCreate(
                [
                    'group_id' => $team->group_id,
                    'team_id' => $team->id,
                ],
                [
                    'played' => 0,
                    'wins' => 0,
                    'draws' => 0,
                    'losses' => 0,
                    'goals_for' => 0,
                    'goals_against' => 0,
                    'goal_difference' => 0,
                    'points' => 0,
                    'rank' => 1,
                    'qualification_status' => 'undecided',
                ],
            );
        });

        foreach ($payload['matches'] as $match) {
            $group = $match['group_name'] ? $groups[$match['group_name']] : null;
            $homeTeam = $teams->get($match['home_team_name']);
            $awayTeam = $teams->get($match['away_team_name']);
            $kickoffUtc = Carbon::parse($match['kickoff_at_utc'], 'UTC');
            $kickoffAmsterdam = $kickoffUtc->copy()->setTimezone(self::DISPLAY_TIMEZONE);

            TournamentMatch::query()->create([
                'tournament_id' => $tournament->id,
                'fifa_match_number' => $match['fifa_match_number'],
                'stage' => $match['stage'],
                'round_label' => $match['group_name'] ?: $match['stage'],
                'group_name' => $match['group_name'],
                'group_id' => $group?->id,
                'match_date' => $kickoffAmsterdam->toDateString(),
                'kickoff_at_local' => $kickoffAmsterdam->format('Y-m-d H:i:s'),
                'timezone_name' => self::DISPLAY_TIMEZONE,
                'kickoff_at_utc' => $kickoffUtc->format('Y-m-d H:i:s'),
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
                'matchday' => $match['round_order'],
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

    protected function capacityFor(string $hostMarket): ?int
    {
        return [
            'Vancouver' => 54500,
            'Seattle' => 69000,
            'San Francisco Bay Area' => 68500,
            'Los Angeles' => 70240,
            'Guadalajara' => 48000,
            'Mexico City' => 87500,
            'Monterrey' => 53500,
            'Houston' => 72220,
            'Dallas' => 80000,
            'Kansas City' => 76400,
            'Atlanta' => 71000,
            'Miami' => 65000,
            'Toronto' => 45000,
            'Boston' => 65878,
            'Philadelphia' => 69000,
            'New York New Jersey' => 82500,
        ][$hostMarket] ?? null;
    }

    protected function confederationFor(string $countryCode): string
    {
        $uefa = ['at', 'ba', 'be', 'ch', 'cz', 'de', 'es', 'fr', 'gb-eng', 'gb-sct', 'hr', 'nl', 'no', 'pt', 'se', 'tr'];
        $concacaf = ['ca', 'cw', 'ht', 'mx', 'pa', 'us'];
        $conmebol = ['ar', 'br', 'co', 'ec', 'py', 'uy'];
        $caf = ['ci', 'cv', 'dz', 'eg', 'gh', 'ma', 'sn', 'tn', 'za'];
        $afc = ['au', 'ir', 'iq', 'jo', 'jp', 'kr', 'qa', 'sa', 'uz'];
        $ofc = ['nz'];

        return match (true) {
            in_array($countryCode, $uefa, true) => 'UEFA',
            in_array($countryCode, $concacaf, true) => 'Concacaf',
            in_array($countryCode, $conmebol, true) => 'CONMEBOL',
            in_array($countryCode, $caf, true) => 'CAF',
            in_array($countryCode, $afc, true) => 'AFC',
            in_array($countryCode, $ofc, true) => 'OFC',
            default => 'TBD',
        };
    }
}
