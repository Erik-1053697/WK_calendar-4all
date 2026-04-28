<?php

namespace App\Http\Resources;

use App\Models\Prediction;
use App\Services\Predictions\PredictionWindowService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class MatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Prediction|null $prediction */
        $prediction = $this->relationLoaded('predictions') ? $this->predictions->first() : null;
        $window = app(PredictionWindowService::class)->matchWindow($this->resource);

        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'fifa_match_number' => $this->fifa_match_number,
            'stage' => $this->stage,
            'round_label' => $this->round_label,
            'group_name' => $this->group_name,
            'group_id' => $this->group_id,
            'match_date' => $this->match_date?->toDateString(),
            'kickoff_at_local' => $this->timezone_name
                ? Carbon::parse($this->getRawOriginal('kickoff_at_local'), $this->timezone_name)->toIso8601String()
                : $this->kickoff_at_local?->toIso8601String(),
            'kickoff_at_utc' => $this->kickoff_at_utc?->copy()?->utc()?->toIso8601String(),
            'timezone_name' => $this->timezone_name,
            'home_team_id' => $this->home_team_id,
            'away_team_id' => $this->away_team_id,
            'winner_team_id' => $this->winner_team_id,
            'home_team_name' => $this->home_team_name,
            'away_team_name' => $this->away_team_name,
            'home_team_flag_url' => $this->relationLoaded('homeTeam') ? ($this->homeTeam?->flag_url ?: $this->homeTeam?->image_url) : null,
            'away_team_flag_url' => $this->relationLoaded('awayTeam') ? ($this->awayTeam?->flag_url ?: $this->awayTeam?->image_url) : null,
            'home_team_code' => $this->relationLoaded('homeTeam') ? ($this->homeTeam?->fifa_code ?: $this->homeTeam?->code) : null,
            'away_team_code' => $this->relationLoaded('awayTeam') ? ($this->awayTeam?->fifa_code ?: $this->awayTeam?->code) : null,
            'home_team_slot' => $this->home_team_slot,
            'away_team_slot' => $this->away_team_slot,
            'venue' => $this->relationLoaded('venue') ? new VenueResource($this->venue) : null,
            'status' => $this->presentationStatus(),
            'raw_status' => $this->status,
            'home_score' => $this->home_score,
            'away_score' => $this->away_score,
            'home_points_awarded' => $this->home_points_awarded,
            'away_points_awarded' => $this->away_points_awarded,
            'result_entered_at' => $this->result_entered_at?->toIso8601String(),
            'round_order' => $this->round_order,
            'match_order' => $this->match_order,
            'matchday' => $this->matchday,
            'is_locked' => $this->is_locked,
            'is_closed' => $this->isClosed(),
            'prediction_window' => $window,
            'prediction_status' => match (true) {
                $this->isClosed() => 'closed',
                $prediction?->locked_at !== null => 'locked',
                $prediction !== null => 'draft',
                default => 'none',
            },
            'my_prediction' => $prediction ? new PredictionResource($prediction) : null,
        ];
    }

    protected function presentationStatus(): string
    {
        if ($this->status === 'completed') {
            return 'completed';
        }

        if ($this->status === 'live') {
            return 'live';
        }

        $kickoff = $this->kickoff_at_utc ?? $this->kickoff_at_local;

        if ($kickoff && $kickoff->isPast() && $kickoff->copy()->addHours(2)->isFuture()) {
            return 'live';
        }

        return 'upcoming';
    }
}
