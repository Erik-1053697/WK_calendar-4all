<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamSelectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'name' => $this->name,
            'code' => $this->code,
            'fifa_code' => $this->fifa_code,
            'group_slot' => $this->group_slot,
            'flag_url' => $this->flag_url,
            'image_url' => $this->image_url,
        ];
    }
}
