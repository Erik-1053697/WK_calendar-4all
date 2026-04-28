<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupWinnerPredictionResource;
use App\Http\Resources\MatchResource;
use App\Http\Resources\TeamSelectionResource;
use App\Http\Resources\TournamentWinnerPredictionResource;
use App\Models\Group;
use App\Models\GroupWinnerPrediction;
use App\Models\TournamentWinnerPrediction;
use App\Models\TournamentMatch;
use App\Services\Predictions\PredictionLeaderboardService;
use App\Services\Predictions\PredictionWindowService;
use App\Services\Predictions\SpecialPredictionService;
use App\Services\Tournaments\TournamentResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PredictionDashboardController extends Controller
{
    public function __invoke(
        Request $request,
        TournamentResolver $tournamentResolver,
        PredictionLeaderboardService $leaderboardService,
        SpecialPredictionService $specialPredictionService,
        PredictionWindowService $predictionWindowService,
    ): JsonResponse {
        $tournament = $tournamentResolver->current();
        $user = $request->user();

        $specialPredictionService->lockExpiredPredictions($tournament);

        $matches = TournamentMatch::query()
            ->with([
                'venue.city',
                'homeTeam',
                'awayTeam',
                'predictions' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))
            ->ordered()
            ->get();

        $groups = Group::query()
            ->with(['teams' => fn ($query) => $query->orderBy('display_order')->orderBy('name')])
            ->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))
            ->orderBy('display_order')
            ->get();

        $groupWinnerPredictions = GroupWinnerPrediction::query()
            ->with('predictedTeam')
            ->where('user_id', $user->id)
            ->when($tournament, fn ($query) => $query->whereHas('group', fn ($groupQuery) => $groupQuery->where('tournament_id', $tournament->id)))
            ->get()
            ->keyBy('group_id');

        $tournamentWinnerPrediction = TournamentWinnerPrediction::query()
            ->with('predictedTeam')
            ->where('user_id', $user->id)
            ->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))
            ->first();

        $winnerPredictionWindow = $predictionWindowService->tournamentWindow($tournament);

        return response()->json([
            'data' => [
                'stats' => $leaderboardService->statsForUser($user, $tournament),
                'tournament' => $tournament ? [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'year' => $tournament->year,
                ] : null,
                'winner_prediction' => [
                    'prediction_window' => $winnerPredictionWindow,
                    'prediction' => $tournamentWinnerPrediction ? (new TournamentWinnerPredictionResource($tournamentWinnerPrediction))->resolve() : null,
                    'teams' => TeamSelectionResource::collection(
                        $groups
                            ->flatMap(fn ($group) => $group->teams)
                            ->sortBy(fn ($team) => sprintf('%s-%s', $team->group_slot ?? 'ZZZ', $team->name))
                            ->values()
                    )->resolve(),
                ],
                'group_winner_predictions' => [
                    'prediction_window' => $winnerPredictionWindow,
                    'groups' => $groups->map(function (Group $group) use ($groupWinnerPredictions): array {
                        $prediction = $groupWinnerPredictions->get($group->id);

                        return [
                            'id' => $group->id,
                            'code' => $group->code,
                            'name' => $group->name,
                            'prediction' => $prediction ? (new GroupWinnerPredictionResource($prediction))->resolve() : null,
                            'teams' => TeamSelectionResource::collection($group->teams)->resolve(),
                        ];
                    })->values(),
                ],
                'upcoming_matches' => MatchResource::collection(
                    $matches
                        ->filter(fn (TournamentMatch $match) => ! $match->isCompleted())
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
