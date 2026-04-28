<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PredictionGroup\JoinPredictionGroupRequest;
use App\Http\Requests\PredictionGroup\StorePredictionGroupRequest;
use App\Http\Resources\PredictionGroupResource;
use App\Models\PredictionGroup;
use App\Services\Predictions\PredictionGroupService;
use App\Services\Predictions\PredictionLeaderboardService;
use App\Services\Tournaments\TournamentResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PredictionGroupController extends Controller
{
    public function __construct(
        private readonly PredictionGroupService $predictionGroupService,
        private readonly PredictionLeaderboardService $predictionLeaderboardService,
    ) {
    }

    public function index(Request $request, TournamentResolver $tournamentResolver): JsonResponse
    {
        $tournament = $tournamentResolver->current();

        $groups = $request->user()
            ->predictionGroups()
            ->with(['owner', 'members'])
            ->when($tournament, fn ($query) => $query->where('prediction_groups.tournament_id', $tournament->id))
            ->get();

        return response()->json([
            'data' => [
                'tournament_id' => $tournament?->id,
                'groups' => PredictionGroupResource::collection($groups)->resolve(),
            ],
        ]);
    }

    public function show(Request $request, PredictionGroup $predictionGroup): JsonResponse
    {
        $this->ensureMembership($request, $predictionGroup);

        $predictionGroup->load(['owner', 'members', 'tournament']);
        $entries = $this->predictionLeaderboardService
            ->rows($predictionGroup->tournament, $predictionGroup->members->pluck('id')->all())
            ->values();

        return response()->json([
            'data' => [
                'group' => (new PredictionGroupResource($predictionGroup))->resolve(),
                'entries' => $entries,
            ],
        ]);
    }

    public function store(
        StorePredictionGroupRequest $request,
        TournamentResolver $tournamentResolver,
    ): JsonResponse {
        $tournament = $tournamentResolver->current();

        if (! $tournament) {
            throw ValidationException::withMessages([
                'group' => 'Er is momenteel geen actief toernooi beschikbaar voor voorspellersgroepen.',
            ]);
        }

        $group = $this->predictionGroupService->create(
            $request->user(),
            $tournament,
            $request->string('name')->toString(),
        );

        return response()->json([
            'data' => new PredictionGroupResource($group),
            'message' => 'Je voorspellersgroep is aangemaakt.',
        ], 201);
    }

    public function join(JoinPredictionGroupRequest $request): JsonResponse
    {
        $group = $this->predictionGroupService->join(
            $request->user(),
            $request->string('invite_code')->toString(),
        );

        return response()->json([
            'data' => new PredictionGroupResource($group),
            'message' => 'Je bent toegevoegd aan de voorspellersgroep.',
        ]);
    }

    protected function ensureMembership(Request $request, PredictionGroup $predictionGroup): void
    {
        $isMember = $predictionGroup->members()
            ->where('users.id', $request->user()->id)
            ->exists();

        if (! $isMember) {
            abort(403);
        }
    }
}
