<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    protected $fillable = [
        'group_id',
        'name',
        'code',
        'fifa_code',
        'country_code',
        'group_slot',
        'display_order',
        'image_url',
        'flag_url',
        'confederation',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function homeMatches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'home_team_id');
    }

    public function awayMatches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'away_team_id');
    }

    public function wonMatches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'winner_team_id');
    }

    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class);
    }
}
