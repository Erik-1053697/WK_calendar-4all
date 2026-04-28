<?php

namespace App\Services\Predictions;

use App\Models\Prediction;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Support\Collection;

class PredictionLeaderboardService
{
    public function __construct(private readonly PredictionScoringService $scoringService)
    {
    }

    public function rows(?Tournament $tournament = null, ?array $userIds = null): Collection
    {
        $predictions = Prediction::query()
            ->with(['user', 'match'])
            ->when($userIds !== null, fn ($query) => $query->whereIn('user_id', $userIds))
            ->when($tournament, fn ($query) => $query->whereHas('match', fn ($matchQuery) => $matchQuery->where('tournament_id', $tournament->id)))
            ->get()
            ->groupBy('user_id');

        $users = User::query()
            ->when($userIds !== null, fn ($query) => $query->whereIn('id', $userIds))
            ->orderBy('name')
            ->get();

        $rows = $users->map(function (User $user) use ($predictions, $tournament): array {
            $userPredictions = $predictions->get($user->id, collect());
            $completedPredictions = $userPredictions->filter(fn (Prediction $prediction) => $prediction->match?->isCompleted());
            $totalPoints = $completedPredictions->sum(fn (Prediction $prediction) => $this->scoringService->pointsFor($prediction, $prediction->match));
            $exactScores = $completedPredictions->filter(fn (Prediction $prediction) => $this->scoringService->isExactScore($prediction, $prediction->match))->count();
            $correctOutcomes = $completedPredictions->filter(fn (Prediction $prediction) => $this->scoringService->isCorrectOutcome($prediction, $prediction->match))->count();

            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'avatar_url' => $user->avatar_url,
                'tournament_id' => $tournament?->id,
                'total_points' => $totalPoints,
                'predictions_count' => $userPredictions->count(),
                'locked_predictions' => $userPredictions->filter(fn (Prediction $prediction) => $prediction->isLocked())->count(),
                'exact_scores' => $exactScores,
                'correct_outcomes' => $correctOutcomes,
                'accuracy' => $completedPredictions->count() > 0
                    ? round(($correctOutcomes / $completedPredictions->count()) * 100, 1)
                    : 0,
                'rank' => 1,
            ];
        });

        $sorted = $rows
            ->sort(fn (array $left, array $right) => ($right['total_points'] <=> $left['total_points'])
                ?: ($right['exact_scores'] <=> $left['exact_scores'])
                ?: ($right['correct_outcomes'] <=> $left['correct_outcomes'])
                ?: strcmp($left['name'], $right['name']))
            ->values();

        $previousPoints = null;
        $currentRank = 0;

        return $sorted->map(function (array $row, int $index) use (&$previousPoints, &$currentRank): array {
            if ($previousPoints !== $row['total_points']) {
                $currentRank = $index + 1;
                $previousPoints = $row['total_points'];
            }

            $row['rank'] = $currentRank;

            return $row;
        });
    }

    public function statsForUser(User $user, ?Tournament $tournament = null): array
    {
        $rows = $this->rows($tournament);
        $row = $rows->firstWhere('user_id', $user->id) ?? [
            'total_points' => 0,
            'predictions_count' => 0,
            'locked_predictions' => 0,
            'exact_scores' => 0,
            'correct_outcomes' => 0,
            'accuracy' => 0,
            'rank' => 1,
        ];

        return $row;
    }
}
