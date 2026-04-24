<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    protected $fillable = [
        'tournament_id',
        'city_id',
        'host_market',
        'stadium_name',
        'capacity',
        'display_order',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'venue_id');
    }
}
