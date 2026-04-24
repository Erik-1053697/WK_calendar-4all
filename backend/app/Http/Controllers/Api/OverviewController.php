<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\Group;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Models\Venue;
use App\Services\Tournaments\TournamentResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class OverviewController extends Controller
{
    public function __invoke(Request $request, TournamentResolver $tournamentResolver): JsonResponse
    {
        $tournament = $tournamentResolver->current();
        $matchQuery = TournamentMatch::query()
            ->with([
                'venue.city',
                'predictions' => fn ($query) => $request->user()
                    ? $query->where('user_id', $request->user()->id)
                    : $query->whereRaw('1 = 0'),
            ])
            ->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id));

        $matches = (clone $matchQuery)->ordered()->get();
        $now = Carbon::now();
        $todayStart = Carbon::now('Europe/Amsterdam')->startOfDay()->utc();
        $todayEnd = Carbon::now('Europe/Amsterdam')->endOfDay()->utc();

        $todayMatches = $matches
            ->filter(fn (TournamentMatch $match) => $match->kickoff_at_utc?->betweenIncluded($todayStart, $todayEnd))
            ->values();
        $liveMatches = $matches
            ->filter(fn (TournamentMatch $match) => $this->statusFor($match, $now) === 'live')
            ->values();
        $nextKnockout = $matches
            ->first(fn (TournamentMatch $match) => $match->stage !== 'Group Stage' && $this->statusFor($match, $now) === 'upcoming');
        $bracketPreview = $matches
            ->filter(fn (TournamentMatch $match) => $match->stage !== 'Group Stage')
            ->take(16)
            ->values();

        return response()->json([
            'data' => [
                'tournament' => $tournament ? [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'year' => $tournament->year,
                    'start_date' => $tournament->start_date?->toDateString(),
                    'end_date' => $tournament->end_date?->toDateString(),
                    'status' => $tournament->status,
                ] : null,
                'summary' => [
                    'total_matches' => $matches->count(),
                    'total_teams' => Team::query()->count(),
                    'total_venues' => Venue::query()->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))->count(),
                    'played_matches' => $matches->filter(fn (TournamentMatch $match) => $this->statusFor($match, $now) === 'completed')->count(),
                    'upcoming_matches' => $matches->filter(fn (TournamentMatch $match) => $this->statusFor($match, $now) === 'upcoming')->count(),
                    'live_matches' => $liveMatches->count(),
                ],
                'fixtures' => MatchResource::collection($matches->take(36))->resolve(),
                'today_matches' => MatchResource::collection($todayMatches)->resolve(),
                'live_matches' => MatchResource::collection($liveMatches)->resolve(),
                'next_knockout_match' => $nextKnockout ? (new MatchResource($nextKnockout))->resolve() : null,
                'qualification_snapshot' => [
                    'groups' => Group::query()->when($tournament, fn ($query) => $query->where('tournament_id', $tournament->id))->count(),
                    'qualified' => 0,
                    'undecided' => Team::query()->count(),
                    'eliminated' => 0,
                ],
                'bracket_preview' => MatchResource::collection($bracketPreview)->resolve(),
            ],
        ]);
    }

    protected function statusFor(TournamentMatch $match, Carbon $now): string
    {
        if ($match->status === 'completed') {
            return 'completed';
        }

        $kickoff = $match->kickoff_at_utc ?? $match->kickoff_at_local;

        if ($kickoff && $kickoff->isPast() && $kickoff->copy()->addHours(2)->greaterThan($now)) {
            return 'live';
        }

        return 'upcoming';
    }
}
