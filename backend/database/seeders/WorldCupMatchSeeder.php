<?php

namespace Database\Seeders;

use App\Models\Venue;
use App\Models\TournamentMatch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class WorldCupMatchSeeder extends Seeder
{
    public function run(): void
    {
        $payload = json_decode(
            File::get(database_path('data/world_cup_2026_matches.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        TournamentMatch::query()->delete();
        Venue::query()->delete();

        $venues = collect($payload['venues'])
            ->values()
            ->map(function (array $venue, int $index) {
                $venue['display_order'] = $index + 1;

                return Venue::query()->create($venue);
            })
            ->keyBy('host_market');

        foreach ($payload['matches'] as $match) {
            TournamentMatch::query()->create([
                'fifa_match_number' => $match['fifa_match_number'],
                'stage' => $match['stage'],
                'group_name' => $match['group_name'],
                'match_date' => $match['match_date'],
                'kickoff_at_local' => $match['kickoff_at_local'],
                'timezone_name' => $match['timezone_name'],
                'kickoff_at_utc' => $match['kickoff_at_utc'],
                'venue_id' => $venues[$match['venue_host_market']]->id,
                'home_team_name' => $match['home_team_name'],
                'away_team_name' => $match['away_team_name'],
                'home_team_slot' => $match['home_team_slot'],
                'away_team_slot' => $match['away_team_slot'],
                'round_order' => $match['round_order'],
                'match_order' => $match['match_order'],
            ]);
        }
    }
}
