<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\TournamentMatch;
use App\Services\Predictions\PredictionLeaderboardService;
use App\Services\Tournaments\TournamentResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PredictionDashboardController extends Controller
{
    public function __invoke(
        Request $request,
        TournamentResolver $tournamentResolver,
        PredictionLeaderboardService $leaderboardService,
    ): JsonResponse {
        $tournament = $tournamentResolver->current();
        $user = $request->user();

        $matches = TournamentMatch::query()
            ->with([
                'venue.city',
                'predictions' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))
            ->ordered()
            ->get();

        return response()->json([
            'data' => [
                'stats' => $leaderboardService->statsForUser($user, $tournament),
                'upcoming_matches' => MatchResource::collection(
                    $matches
                        ->filter(fn (TournamentMatch $match) => ! $match->isClosed() && ! $match->isCompleted())
                        ->take(24)
                        ->values()
                )->resolve(),
                'recent_predictions' => MatchResource::collection(
                    $matches
                        ->filter(fn (TournamentMatch $match) => $match->predictions->isNotEmpty())
                        ->take(16)
                        ->values()
                )->resolve(),
                'community_leaderboard' => $leaderboardService->rows($tournament)->take(8)->values(),
            ],
        ]);
    }
}
