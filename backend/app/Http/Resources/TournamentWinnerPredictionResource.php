<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentWinnerPredictionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'tournament_id' => $this->tournament_id,
            'predicted_team_id' => $this->predicted_team_id,
            'team' => $this->relationLoaded('predictedTeam') && $this->predictedTeam
                ? new TeamSelectionResource($this->predictedTeam)
                : null,
            'points_awarded' => $this->points_awarded,
            'locked_at' => optional($this->locked_at)?->toIso8601String(),
            'is_locked' => $this->isLocked(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
