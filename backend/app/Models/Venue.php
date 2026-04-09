<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    protected $fillable = [
        'host_market',
        'city',
        'stadium_name',
        'country',
        'timezone_name',
        'display_order',
    ];

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'venue_id');
    }
}
