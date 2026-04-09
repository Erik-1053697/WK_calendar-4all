<?php

namespace App\Http\Resources;

use App\Models\Prediction;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Prediction|null $prediction */
        $prediction = $this->relationLoaded('predictions') ? $this->predictions->first() : null;

        return [
            'id' => $this->id,
            'fifa_match_number' => $this->fifa_match_number,
            'stage' => $this->stage,
            'group_name' => $this->group_name,
            'match_date' => $this->match_date?->toDateString(),
            'kickoff_at_local' => $this->timezone_name
                ? Carbon::parse($this->getRawOriginal('kickoff_at_local'), $this->timezone_name)->toIso8601String()
                : $this->kickoff_at_local?->toIso8601String(),
            'kickoff_at_utc' => $this->kickoff_at_utc?->copy()?->utc()?->toIso8601String(),
            'timezone_name' => $this->timezone_name,
            'home_team_name' => $this->home_team_name,
            'away_team_name' => $this->away_team_name,
            'home_team_slot' => $this->home_team_slot,
            'away_team_slot' => $this->away_team_slot,
            'venue' => $this->relationLoaded('venue') ? new VenueResource($this->venue) : null,
            'round_order' => $this->round_order,
            'match_order' => $this->match_order,
            'is_locked' => $this->is_locked,
            'is_closed' => $this->isClosed(),
            'prediction_status' => match (true) {
                $this->isClosed() => 'closed',
                $prediction?->locked_at !== null => 'locked',
                $prediction !== null => 'draft',
                default => 'none',
            },
            'my_prediction' => $prediction ? new PredictionResource($prediction) : null,
        ];
    }
}
