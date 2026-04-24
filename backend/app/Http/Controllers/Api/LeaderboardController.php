<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Predictions\PredictionLeaderboardService;
use App\Services\Tournaments\TournamentResolver;
use Illuminate\Http\JsonResponse;

class LeaderboardController extends Controller
{
    public function __invoke(
        TournamentResolver $tournamentResolver,
        PredictionLeaderboardService $leaderboardService,
    ): JsonResponse {
        $tournament = $tournamentResolver->current();

        return response()->json([
            'data' => [
                'tournament_id' => $tournament?->id,
                'entries' => $leaderboardService->rows($tournament)->values(),
            ],
        ]);
    }
}
