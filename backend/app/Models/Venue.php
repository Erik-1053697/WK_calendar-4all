<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    protected $fillable = [
        'city_id',
        'host_market',
        'stadium_name',
        'display_order',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'venue_id');
    }
}
