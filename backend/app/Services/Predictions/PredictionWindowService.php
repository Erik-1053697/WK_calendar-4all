<?php

namespace App\Services\Predictions;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Support\Carbon;

class PredictionWindowService
{
    public function tournamentLockAt(?Tournament $tournament): ?Carbon
    {
        if (! $tournament) {
            return null;
        }

        $firstKickoff = TournamentMatch::query()
            ->where('tournament_id', $tournament->id)
            ->whereNotNull('kickoff_at_utc')
            ->orderBy('kickoff_at_utc')
            ->value('kickoff_at_utc');

        if ($firstKickoff) {
            return Carbon::parse($firstKickoff)->utc();
        }

        if ($tournament->start_date) {
            return $tournament->start_date
                ->copy()
                ->setTimezone('Europe/Amsterdam')
                ->startOfDay()
                ->utc();
        }

        return null;
    }

    public function matchLockAt(TournamentMatch $match): ?Carbon
    {
        $kickoff = $match->kickoff_at_utc ?? $match->kickoff_at_local;

        return $kickoff?->copy()?->utc();
    }

    public function tournamentWindow(?Tournament $tournament): array
    {
        $lockAt = $this->tournamentLockAt($tournament);

        return $this->window($lockAt, $lockAt?->isPast() ?? false);
    }

    public function matchWindow(TournamentMatch $match): array
    {
        return $this->window($this->matchLockAt($match), $match->isClosed());
    }

    public function window(?Carbon $lockAt, bool $locked = false): array
    {
        $now = Carbon::now()->utc();
        $secondsUntilLock = $lockAt ? max(0, $now->diffInSeconds($lockAt, false)) : null;
        $isLocked = $locked || ($lockAt !== null && $lockAt->lessThanOrEqualTo($now));

        return [
            'lock_at' => $lockAt?->toIso8601String(),
            'is_locked' => $isLocked,
            'seconds_until_lock' => $isLocked || $secondsUntilLock === null ? 0 : $secondsUntilLock,
            'days_until_lock' => $isLocked || $secondsUntilLock === null ? 0 : (int) ceil($secondsUntilLock / 86400),
            'show_countdown' => ! $isLocked && $secondsUntilLock !== null && $secondsUntilLock <= 72 * 3600,
        ];
    }
}
