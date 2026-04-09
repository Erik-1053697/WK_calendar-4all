<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class Prediction extends Model
{
    protected $fillable = [
        'user_id',
        'match_id',
        'predicted_home_score',
        'predicted_away_score',
        'locked_at',
    ];

    protected function casts(): array
    {
        return [
            'locked_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (Prediction $prediction): void {
            if ($prediction->getOriginal('locked_at') !== null) {
                $protectedFields = [
                    'user_id',
                    'match_id',
                    'predicted_home_score',
                    'predicted_away_score',
                    'locked_at',
                ];

                if ($prediction->isDirty($protectedFields)) {
                    throw ValidationException::withMessages([
                        'prediction' => 'Locked predictions cannot be modified.',
                    ]);
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function isLocked(): bool
    {
        return $this->locked_at !== null;
    }
}
