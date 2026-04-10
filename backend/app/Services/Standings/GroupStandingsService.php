<?php

namespace App\Services\Standings;

use App\Models\Group;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

class GroupStandingsService
{
    public function build(): Collection
    {
        $groups = Group::query()
            ->with(['teams' => fn ($query) => $query->orderBy('display_order')->orderBy('name')])
            ->orderBy('display_order')
            ->get();

        $matches = TournamentMatch::query()
            ->where('stage', 'Group Stage')
            ->whereNotNull('group_id')
            ->whereNotNull('home_team_id')
            ->whereNotNull('away_team_id')
            ->get();

        return $groups->map(function (Group $group) use ($matches): array {
            $table = $group->teams->values()->mapWithKeys(fn ($team, $index) => [
                $team->id => [
                    'team_id' => $team->id,
                    'team_name' => $team->name,
                    'fifa_code' => $team->fifa_code,
                    'country_code' => $team->country_code,
                    'image_url' => $team->image_url,
                    'group_slot' => $team->group_slot,
                    'seed_order' => $index + 1,
                    'played' => 0,
                    'won' => 0,
                    'drawn' => 0,
                    'lost' => 0,
                    'goals_for' => 0,
                    'goals_against' => 0,
                    'goal_difference' => 0,
                    'points' => 0,
                ],
            ]);

            $groupMatches = $matches->where('group_id', $group->id);
            $playedMatches = 0;

            foreach ($groupMatches as $match) {
                $hasStoredPoints = $match->home_points_awarded !== null || $match->away_points_awarded !== null;
                $hasScoreline = $match->home_score !== null && $match->away_score !== null;

                if (! $hasStoredPoints && ! $hasScoreline) {
                    continue;
                }

                $playedMatches++;

                $home = $table->get($match->home_team_id);
                $away = $table->get($match->away_team_id);

                if (! $home || ! $away) {
                    continue;
                }

                $home['played']++;
                $away['played']++;

                if ($hasScoreline) {
                    $home['goals_for'] += $match->home_score;
                    $home['goals_against'] += $match->away_score;
                    $away['goals_for'] += $match->away_score;
                    $away['goals_against'] += $match->home_score;
                }

                [$calculatedHomePoints, $calculatedAwayPoints] = $hasScoreline
                    ? $this->resolvePoints($match->home_score, $match->away_score)
                    : [0, 0];

                $homePoints = $match->home_points_awarded ?? $calculatedHomePoints;
                $awayPoints = $match->away_points_awarded ?? $calculatedAwayPoints;

                $home['points'] += $homePoints;
                $away['points'] += $awayPoints;

                if ($homePoints === 3) {
                    $home['won']++;
                    $away['lost']++;
                } elseif ($awayPoints === 3) {
                    $away['won']++;
                    $home['lost']++;
                } else {
                    $home['drawn']++;
                    $away['drawn']++;
                }

                $home['goal_difference'] = $home['goals_for'] - $home['goals_against'];
                $away['goal_difference'] = $away['goals_for'] - $away['goals_against'];

                $table->put($match->home_team_id, $home);
                $table->put($match->away_team_id, $away);
            }

            $isRankedByPoints = $playedMatches > 0;

            $standings = $table->values();

            if ($isRankedByPoints) {
                $standings = $standings->sort(function (array $left, array $right): int {
                    return ($right['points'] <=> $left['points'])
                        ?: ($right['goal_difference'] <=> $left['goal_difference'])
                        ?: ($right['goals_for'] <=> $left['goals_for'])
                        ?: ($left['goals_against'] <=> $right['goals_against'])
                        ?: ($left['seed_order'] <=> $right['seed_order'])
                        ?: strcmp($left['team_name'], $right['team_name']);
                })->values();
            } else {
                $standings = $standings->sortBy('seed_order')->values();
            }

            $standings = $this->assignPositions($standings, $isRankedByPoints);

            return [
                'id' => $group->id,
                'code' => $group->code,
                'name' => $group->name,
                'played_matches' => $playedMatches,
                'is_ranked_by_points' => $isRankedByPoints,
                'standings' => $standings,
            ];
        });
    }

    protected function resolvePoints(int $homeScore, int $awayScore): array
    {
        if ($homeScore > $awayScore) {
            return [3, 0];
        }

        if ($awayScore > $homeScore) {
            return [0, 3];
        }

        return [1, 1];
    }

    protected function assignPositions(Collection $standings, bool $isRankedByPoints): Collection
    {
        if (! $isRankedByPoints) {
            return $standings->map(function (array $row): array {
                $row['position'] = 1;

                return $row;
            });
        }

        $previousPoints = null;
        $currentPosition = 0;

        return $standings->values()->map(function (array $row, int $index) use (&$previousPoints, &$currentPosition): array {
            if ($previousPoints !== $row['points']) {
                $currentPosition = $index + 1;
                $previousPoints = $row['points'];
            }

            $row['position'] = $currentPosition;

            return $row;
        });
    }
}
