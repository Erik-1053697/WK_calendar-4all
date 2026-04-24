<?php

namespace App\Services\Tournaments;

use App\Models\Tournament;

class TournamentResolver
{
    public function current(): ?Tournament
    {
        return Tournament::query()
            ->orderByRaw("CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 WHEN 'completed' THEN 3 ELSE 4 END")
            ->orderByDesc('year')
            ->first();
    }
}
