<?php

namespace App\Policies;

use App\Models\TournamentMatch;
use App\Models\User;

class TournamentMatchPolicy
{
    public function predict(User $user, TournamentMatch $match): bool
    {
        return ! $match->isClosed();
    }

    public function manage(User $user): bool
    {
        return $user->is_admin;
    }
}
