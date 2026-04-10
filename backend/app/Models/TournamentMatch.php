<?php

namespace App\Models;

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
        'group_id',
        'match_date',
        'kickoff_at_local',
        'timezone_name',
        'kickoff_at_utc',
        'venue_id',
        'home_team_id',
        'away_team_id',
        'winner_team_id',
        'home_team_name',
        'away_team_name',
        'home_team_slot',
        'away_team_slot',
        'status',
        'home_score',
        'away_score',
        'home_points_awarded',
        'away_points_awarded',
        'result_entered_at',
        'result_entered_by',
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
            'result_entered_at' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function winnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    public function resultEditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'result_entered_by');
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class, 'match_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isClosed(): bool
    {
        $kickoff = $this->kickoff_at_utc ?? $this->kickoff_at_local;

        return $this->is_locked || ($kickoff !== null && $kickoff->isPast());
    }

    public function scopeOrdered(Builder $query): void
    {
        $query
            ->orderBy('round_order')
            ->orderBy('match_date')
            ->orderBy('kickoff_at_local')
            ->orderBy('match_order');
    }
}
