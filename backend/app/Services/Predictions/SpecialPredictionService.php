<?php

namespace App\Services\Predictions;

use App\Models\Group;
use App\Models\GroupWinnerPrediction;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentWinnerPrediction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SpecialPredictionService
{
    public function __construct(private readonly PredictionWindowService $predictionWindowService)
    {
    }

    public function lockExpiredPredictions(?Tournament $tournament): void
    {
        if (! $tournament) {
            return;
        }

        $window = $this->predictionWindowService->tournamentWindow($tournament);

        if (! $window['is_locked'] || ! $window['lock_at']) {
            return;
        }

        TournamentWinnerPrediction::query()
            ->where('tournament_id', $tournament->id)
            ->whereNull('locked_at')
            ->update([
                'locked_at' => $window['lock_at'],
                'is_locked' => true,
            ]);

        $groupIds = $tournament->groups()->pluck('id');

        if ($groupIds->isEmpty()) {
            return;
        }

        GroupWinnerPrediction::query()
            ->whereIn('group_id', $groupIds)
            ->whereNull('locked_at')
            ->update([
                'locked_at' => $window['lock_at'],
                'is_locked' => true,
            ]);
    }

    public function saveTournamentWinner(User $user, Tournament $tournament, int $teamId): TournamentWinnerPrediction
    {
        $this->ensureTournamentWindowOpen($tournament);

        $team = Team::query()
            ->whereKey($teamId)
            ->whereHas('group', fn ($query) => $query->where('tournament_id', $tournament->id))
            ->first();

        if (! $team) {
            throw ValidationException::withMessages([
                'team_id' => 'Kies een geldig team uit dit toernooi.',
            ]);
        }

        return DB::transaction(function () use ($team, $tournament, $user): TournamentWinnerPrediction {
            $prediction = TournamentWinnerPrediction::query()->firstOrNew([
                'user_id' => $user->id,
                'tournament_id' => $tournament->id,
            ]);

            $this->ensureUnlockedTournamentPrediction($prediction);

            $prediction->fill([
                'predicted_team_id' => $team->id,
            ])->save();

            return $prediction->refresh()->load('predictedTeam');
        });
    }

    public function saveGroupWinners(User $user, Tournament $tournament, array $predictions): array
    {
        $this->ensureTournamentWindowOpen($tournament);

        $groups = Group::query()
            ->with('teams')
            ->where('tournament_id', $tournament->id)
            ->get()
            ->keyBy('id');

        return DB::transaction(function () use ($groups, $predictions, $user): array {
            $savedPredictions = [];

            foreach ($predictions as $payload) {
                $group = $groups->get((int) $payload['group_id']);
                $teamId = (int) $payload['team_id'];

                if (! $group) {
                    throw ValidationException::withMessages([
                        'predictions' => 'Een of meer groepen horen niet bij dit toernooi.',
                    ]);
                }

                if (! $group->teams->contains('id', $teamId)) {
                    throw ValidationException::withMessages([
                        'predictions' => "De gekozen groepswinnaar voor {$group->name} hoort niet bij deze groep.",
                    ]);
                }

                $prediction = GroupWinnerPrediction::query()->firstOrNew([
                    'user_id' => $user->id,
                    'group_id' => $group->id,
                ]);

                $this->ensureUnlockedGroupPrediction($prediction);

                $prediction->fill([
                    'predicted_team_id' => $teamId,
                ])->save();

                $savedPredictions[] = $prediction->refresh()->load('predictedTeam', 'group');
            }

            return $savedPredictions;
        });
    }

    protected function ensureTournamentWindowOpen(Tournament $tournament): void
    {
        if ($this->predictionWindowService->tournamentWindow($tournament)['is_locked']) {
            throw ValidationException::withMessages([
                'prediction' => 'De voorspellingen voor eindwinnaar en groepswinnaars zijn vergrendeld zodra het toernooi is gestart.',
            ]);
        }
    }

    protected function ensureUnlockedTournamentPrediction(TournamentWinnerPrediction $prediction): void
    {
        if ($prediction->exists && $prediction->isLocked()) {
            throw ValidationException::withMessages([
                'prediction' => 'Je eindwinnaar-voorspelling is al vergrendeld.',
            ]);
        }
    }

    protected function ensureUnlockedGroupPrediction(GroupWinnerPrediction $prediction): void
    {
        if ($prediction->exists && $prediction->isLocked()) {
            throw ValidationException::withMessages([
                'prediction' => 'Een of meer groepswinnaar-voorspellingen zijn al vergrendeld.',
            ]);
        }
    }
}
