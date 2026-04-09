<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prediction\StorePredictionRequest;
use App\Http\Requests\Prediction\UpdatePredictionRequest;
use App\Http\Resources\PredictionResource;
use App\Models\Prediction;
use App\Models\TournamentMatch;
use App\Services\Predictions\PredictionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PredictionController extends Controller
{
    public function __construct(private readonly PredictionService $predictionService)
    {
    }

    public function myPrediction(Request $request, TournamentMatch $match): JsonResponse
    {
        $prediction = Prediction::query()
            ->where('match_id', $match->id)
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json([
            'data' => $prediction ? new PredictionResource($prediction) : null,
        ]);
    }

    public function store(StorePredictionRequest $request, TournamentMatch $match): PredictionResource
    {
        $this->authorize('predict', $match);

        $prediction = $this->predictionService->create(
            $request->user(),
            $match,
            $request->validated(),
        );

        return new PredictionResource($prediction);
    }

    public function update(UpdatePredictionRequest $request, TournamentMatch $match): PredictionResource
    {
        $prediction = Prediction::query()
            ->where('match_id', $match->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $this->authorize('predict', $match);

        $prediction = $this->predictionService->update(
            $request->user(),
            $match,
            $prediction,
            $request->validated(),
        );

        return new PredictionResource($prediction);
    }

    public function lock(Request $request, TournamentMatch $match): PredictionResource
    {
        $prediction = Prediction::query()
            ->where('match_id', $match->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $this->authorize('predict', $match);

        $prediction = $this->predictionService->lock($request->user(), $match, $prediction);

        return new PredictionResource($prediction);
    }
}
