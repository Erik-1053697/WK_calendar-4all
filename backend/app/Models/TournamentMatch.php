<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'fifa_match_number',
        'stage',
        'group_name',
        'match_date',
        'kickoff_at_local',
        'timezone_name',
        'kickoff_at_utc',
        'venue_id',
        'home_team_name',
        'away_team_name',
        'home_team_slot',
        'away_team_slot',
        'round_order',
        'match_order',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'match_date' => 'date',
            'kickoff_at_local' => 'datetime',
            'kickoff_at_utc' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class, 'match_id');
    }

    public function isClosed(): bool
    {
        $kickoff = $this->kickoff_at_utc ?? $this->kickoff_at_local;

        return $this->is_locked || ($kickoff !== null && $kickoff->isPast());
    }

    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query
            ->orderBy('round_order')
            ->orderBy('match_date')
            ->orderBy('kickoff_at_local')
            ->orderBy('match_order');
    }
}
