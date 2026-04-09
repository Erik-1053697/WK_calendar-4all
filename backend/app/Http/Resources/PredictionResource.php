<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PredictionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'match_id' => $this->match_id,
            'predicted_home_score' => $this->predicted_home_score,
            'predicted_away_score' => $this->predicted_away_score,
            'locked_at' => optional($this->locked_at)?->toIso8601String(),
            'is_locked' => $this->locked_at !== null,
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
