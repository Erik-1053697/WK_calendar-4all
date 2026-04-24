<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VenueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'city_id' => $this->city_id,
            'host_market' => $this->host_market,
            'city' => $this->relationLoaded('city') ? $this->city?->name : null,
            'stadium_name' => $this->stadium_name,
            'capacity' => $this->capacity,
            'country' => $this->relationLoaded('city') ? $this->city?->country : null,
            'timezone_name' => $this->relationLoaded('city') ? $this->city?->timezone_name : null,
            'display_order' => $this->display_order,
        ];
    }
}
