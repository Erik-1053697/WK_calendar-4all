<?php

namespace App\Services\Predictions;

use App\Models\Prediction;
use App\Models\TournamentMatch;

class PredictionScoringService
{
    public const EXACT_SCORE_POINTS = 5;
    public const OUTCOME_POINTS = 2;

    public function pointsFor(Prediction $prediction, TournamentMatch $match): int
    {
        if (! $match->isCompleted() || $match->home_score === null || $match->away_score === null) {
            return 0;
        }

        if (
            $prediction->predicted_home_score === $match->home_score
            && $prediction->predicted_away_score === $match->away_score
        ) {
            return self::EXACT_SCORE_POINTS;
        }

        return $this->outcome($prediction->predicted_home_score, $prediction->predicted_away_score)
            === $this->outcome($match->home_score, $match->away_score)
                ? self::OUTCOME_POINTS
                : 0;
    }

    public function isExactScore(Prediction $prediction, TournamentMatch $match): bool
    {
        return $match->isCompleted()
            && $match->home_score !== null
            && $match->away_score !== null
            && $prediction->predicted_home_score === $match->home_score
            && $prediction->predicted_away_score === $match->away_score;
    }

    public function isCorrectOutcome(Prediction $prediction, TournamentMatch $match): bool
    {
        return $match->isCompleted()
            && $match->home_score !== null
            && $match->away_score !== null
            && $this->outcome($prediction->predicted_home_score, $prediction->predicted_away_score)
                === $this->outcome($match->home_score, $match->away_score);
    }

    protected function outcome(int $homeScore, int $awayScore): string
    {
        if ($homeScore > $awayScore) {
            return 'home';
        }

        if ($awayScore > $homeScore) {
            return 'away';
        }

        return 'draw';
    }
}
