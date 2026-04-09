<?php

namespace App\Services\Predictions;

use App\Models\Prediction;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PredictionService
{
    public function create(User $user, TournamentMatch $match, array $data): Prediction
    {
        $this->ensureMatchAvailable($match);

        if (Prediction::query()->where('user_id', $user->id)->where('match_id', $match->id)->exists()) {
            throw ValidationException::withMessages([
                'prediction' => 'You already created a prediction for this match.',
            ]);
        }

        return DB::transaction(fn () => Prediction::create([
            'user_id' => $user->id,
            'match_id' => $match->id,
            'predicted_home_score' => $data['predicted_home_score'],
            'predicted_away_score' => $data['predicted_away_score'],
        ]));
    }

    public function update(User $user, TournamentMatch $match, Prediction $prediction, array $data): Prediction
    {
        $this->ensureOwnership($user, $prediction);
        $this->ensureMatchAvailable($match);
        $this->ensureUnlocked($prediction);

        $prediction->update([
            'predicted_home_score' => $data['predicted_home_score'],
            'predicted_away_score' => $data['predicted_away_score'],
        ]);

        return $prediction->refresh();
    }

    public function lock(User $user, TournamentMatch $match, Prediction $prediction): Prediction
    {
        $this->ensureOwnership($user, $prediction);
        $this->ensureMatchAvailable($match);
        $this->ensureUnlocked($prediction);

        $prediction->update([
            'locked_at' => Carbon::now(),
        ]);

        return $prediction->refresh();
    }

    public function setMatchLock(TournamentMatch $match, bool $locked = true): TournamentMatch
    {
        $match->update(['is_locked' => $locked]);

        return $match->refresh();
    }

    protected function ensureOwnership(User $user, Prediction $prediction): void
    {
        if ($prediction->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'prediction' => 'You are not allowed to modify this prediction.',
            ]);
        }
    }

    protected function ensureUnlocked(Prediction $prediction): void
    {
        if ($prediction->isLocked()) {
            throw ValidationException::withMessages([
                'prediction' => 'This prediction has already been locked.',
            ]);
        }
    }

    protected function ensureMatchAvailable(TournamentMatch $match): void
    {
        if ($match->isClosed()) {
            throw ValidationException::withMessages([
                'match' => 'Predictions are closed for this match.',
            ]);
        }
    }
}
