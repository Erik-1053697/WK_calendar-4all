<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\LeaderboardEntry;
use App\Models\Standing;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PlatformStructureSeeder extends Seeder
{
    private const DISPLAY_TIMEZONE = 'Europe/Amsterdam';

    public function run(): void
    {
        /** @var array<string, array{fifa_code: string, country_code: string}> $teamAssets */
        $teamAssets = require database_path('seeders/Data/team_assets.php');

        $tournament = Tournament::query()->updateOrCreate(
            [
                'name' => 'World Championship',
                'year' => 2026,
            ],
            [
                'start_date' => '2026-06-11',
                'end_date' => '2026-07-19',
                'status' => 'upcoming',
            ],
        );

        Group::query()->update(['tournament_id' => $tournament->id]);
        Venue::query()->update(['tournament_id' => $tournament->id]);
        TournamentMatch::query()->update(['tournament_id' => $tournament->id]);

        Venue::query()->get()->each(function (Venue $venue): void {
            $venue->update([
                'capacity' => $venue->capacity ?? $this->capacityFor($venue->host_market),
            ]);
        });

        Team::query()->get()->each(function (Team $team) use ($teamAssets): void {
            $asset = $teamAssets[$team->name] ?? null;

            if (! $asset) {
                return;
            }

            $team->update([
                'code' => $asset['fifa_code'],
                'fifa_code' => $asset['fifa_code'],
                'country_code' => $asset['country_code'],
                'image_url' => $this->flagImageUrl($asset['country_code']),
                'flag_url' => $this->flagImageUrl($asset['country_code']),
                'confederation' => $this->confederationFor($asset['country_code']),
            ]);

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

        TournamentMatch::query()
            ->get()
            ->each(function (TournamentMatch $match): void {
                $kickoffUtc = $match->getRawOriginal('kickoff_at_utc')
                    ? Carbon::parse($match->getRawOriginal('kickoff_at_utc'), 'UTC')
                    : Carbon::parse(
                        $match->getRawOriginal('kickoff_at_local'),
                        $match->timezone_name ?: self::DISPLAY_TIMEZONE,
                    )->utc();
                $kickoffAmsterdam = $kickoffUtc->copy()->setTimezone(self::DISPLAY_TIMEZONE);

                $match->update([
                    'round_label' => $match->round_label ?: ($match->group_name ?: $match->stage),
                    'matchday' => $match->matchday ?: $match->round_order,
                    'match_date' => $kickoffAmsterdam->toDateString(),
                    'kickoff_at_local' => $kickoffAmsterdam->format('Y-m-d H:i:s'),
                    'timezone_name' => self::DISPLAY_TIMEZONE,
                    'kickoff_at_utc' => $kickoffUtc->format('Y-m-d H:i:s'),
                ]);
            });

        User::query()->get()->each(function (User $user) use ($tournament): void {
            LeaderboardEntry::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'tournament_id' => $tournament->id,
                ],
                [
                    'total_points' => 0,
                    'rank' => 1,
                ],
            );
        });
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
