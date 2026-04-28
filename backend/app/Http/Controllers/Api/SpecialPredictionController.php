<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prediction\SaveGroupWinnerPredictionsRequest;
use App\Http\Requests\Prediction\SaveTournamentWinnerPredictionRequest;
use App\Http\Resources\GroupWinnerPredictionResource;
use App\Http\Resources\TournamentWinnerPredictionResource;
use App\Models\Tournament;
use App\Services\Predictions\SpecialPredictionService;
use Illuminate\Http\JsonResponse;

class SpecialPredictionController extends Controller
{
    public function __construct(private readonly SpecialPredictionService $specialPredictionService)
    {
    }

    public function saveTournamentWinner(
        SaveTournamentWinnerPredictionRequest $request,
        Tournament $tournament,
    ): JsonResponse {
        $prediction = $this->specialPredictionService->saveTournamentWinner(
            $request->user(),
            $tournament,
            (int) $request->integer('team_id'),
        );

        return response()->json([
            'data' => new TournamentWinnerPredictionResource($prediction),
            'message' => 'Je eindwinnaar-voorspelling is opgeslagen.',
        ]);
    }

    public function saveGroupWinners(
        SaveGroupWinnerPredictionsRequest $request,
        Tournament $tournament,
    ): JsonResponse {
        $predictions = $this->specialPredictionService->saveGroupWinners(
            $request->user(),
            $tournament,
            $request->validated('predictions'),
        );

        return response()->json([
            'data' => GroupWinnerPredictionResource::collection(collect($predictions))->resolve(),
            'message' => 'Je groepswinnaar-voorspellingen zijn opgeslagen.',
        ]);
    }
}
