<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PredictionStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'match_id' => $this['match_id'],
            'total_predictions' => $this['total_predictions'],
            'locked_predictions' => $this['locked_predictions'],
            'draft_predictions' => $this['draft_predictions'],
            'score_breakdown' => $this['score_breakdown'],
        ];
    }
}
