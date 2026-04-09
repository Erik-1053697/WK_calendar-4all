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
            'host_market' => $this->host_market,
            'city' => $this->city,
            'stadium_name' => $this->stadium_name,
            'country' => $this->country,
            'timezone_name' => $this->timezone_name,
            'display_order' => $this->display_order,
        ];
    }
}
