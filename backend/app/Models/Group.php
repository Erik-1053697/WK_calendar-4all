<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = [
        'tournament_id',
        'code',
        'name',
        'display_order',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function groupTeams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'group_teams')->withPivot('sort_order')->withTimestamps();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class);
    }

    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class);
    }
}
