<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\TournamentMatch;
use App\Services\Predictions\PredictionService;
use Illuminate\Http\Request;

class AdminMatchController extends Controller
{
    public function __construct(private readonly PredictionService $predictionService)
    {
    }

    public function lock(Request $request, TournamentMatch $match): MatchResource
    {
        $this->authorize('manage', $match);

        $match = $this->predictionService->setMatchLock($match, true);

        return new MatchResource($match->load('venue'));
    }

    public function unlock(Request $request, TournamentMatch $match): MatchResource
    {
        $this->authorize('manage', $match);

        $match = $this->predictionService->setMatchLock($match, false);

        return new MatchResource($match->load('venue'));
    }
}
