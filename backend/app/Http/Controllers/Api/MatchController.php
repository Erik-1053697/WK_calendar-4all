<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Http\Resources\PredictionStatsResource;
use App\Http\Resources\VenueResource;
use App\Models\Prediction;
use App\Models\TournamentMatch;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatchController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $matches = $this->queryMatches($request)->get();

        return MatchResource::collection($matches);
    }

    public function schedule(Request $request)
    {
        $matches = $this->queryMatches($request)->get();
        $venueIds = $matches->pluck('venue_id')->unique()->all();
        $dates = $matches
            ->pluck('match_date')
            ->filter()
            ->map(fn ($date) => $date->toDateString())
            ->unique()
            ->values();
        $venues = Venue::query()
            ->whereIn('id', $venueIds)
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'data' => [
                'dates' => $dates,
                'venues' => VenueResource::collection($venues)->resolve(),
                'matches' => MatchResource::collection($matches)->resolve(),
            ],
        ]);
    }

    public function show(Request $request, TournamentMatch $match): MatchResource
    {
        $user = $request->user();

        $match->load([
            'venue',
            'predictions' => fn ($query) => $user
                ? $query->where('user_id', $user->id)
                : $query->whereRaw('1 = 0'),
        ]);

        return new MatchResource($match);
    }

    public function predictions(TournamentMatch $match): PredictionStatsResource
    {
        $scoreBreakdown = Prediction::query()
            ->where('match_id', $match->id)
            ->selectRaw('predicted_home_score, predicted_away_score, COUNT(*) as total')
            ->groupBy('predicted_home_score', 'predicted_away_score')
            ->orderByDesc('total')
            ->orderBy('predicted_home_score')
            ->orderBy('predicted_away_score')
            ->get()
            ->map(fn ($row) => [
                'home_score' => (int) $row->predicted_home_score,
                'away_score' => (int) $row->predicted_away_score,
                'total' => (int) $row->total,
            ])
            ->values();

        $totalPredictions = Prediction::query()->where('match_id', $match->id)->count();
        $lockedPredictions = Prediction::query()->where('match_id', $match->id)->whereNotNull('locked_at')->count();

        return new PredictionStatsResource([
            'match_id' => $match->id,
            'total_predictions' => $totalPredictions,
            'locked_predictions' => $lockedPredictions,
            'draft_predictions' => $totalPredictions - $lockedPredictions,
            'score_breakdown' => $scoreBreakdown,
        ]);
    }

    protected function queryMatches(Request $request)
    {
        $user = $request->user();

        return TournamentMatch::query()
            ->with([
                'venue',
                'predictions' => fn ($query) => $user
                    ? $query->where('user_id', $user->id)
                    : $query->whereRaw('1 = 0'),
            ])
            ->when($request->filled('stage'), fn ($query) => $query->where('stage', $request->string('stage')->toString()))
            ->when(
                $request->filled('city'),
                fn ($query) => $query->whereHas(
                    'venue',
                    fn ($venueQuery) => $venueQuery->where('host_market', $request->string('city')->toString())
                )
            )
            ->when(
                $request->filled('date'),
                fn ($query) => $query->whereDate('match_date', $request->date('date'))
            )
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($inner) use ($request) {
                    $term = '%'.$request->string('search')->toString().'%';

                    $inner
                        ->where('home_team_name', 'like', $term)
                        ->orWhere('away_team_name', 'like', $term)
                        ->orWhere('stage', 'like', $term)
                        ->orWhere('group_name', 'like', $term)
                        ->orWhere('home_team_slot', 'like', $term)
                        ->orWhere('away_team_slot', 'like', $term)
                        ->orWhereHas('venue', function ($venueQuery) use ($term) {
                            $venueQuery
                                ->where('host_market', 'like', $term)
                                ->orWhere('city', 'like', $term)
                                ->orWhere('stadium_name', 'like', $term);
                        });
                })
            )
            ->ordered();
    }
}
