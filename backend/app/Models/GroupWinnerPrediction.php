<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class GroupWinnerPrediction extends Model
{
    protected $fillable = [
        'user_id',
        'group_id',
        'predicted_team_id',
        'points_awarded',
        'locked_at',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'locked_at' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (GroupWinnerPrediction $prediction): void {
            if ($prediction->getOriginal('locked_at') !== null || (bool) $prediction->getOriginal('is_locked')) {
                $protectedFields = [
                    'user_id',
                    'group_id',
                    'predicted_team_id',
                    'locked_at',
                    'is_locked',
                ];

                if ($prediction->isDirty($protectedFields)) {
                    throw ValidationException::withMessages([
                        'prediction' => 'Deze groepswinnaar-voorspelling is vergrendeld en kan niet meer worden aangepast.',
                    ]);
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function predictedTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'predicted_team_id');
    }

    public function isLocked(): bool
    {
        return $this->is_locked || $this->locked_at !== null;
    }
}
