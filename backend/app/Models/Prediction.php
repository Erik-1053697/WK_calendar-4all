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
                        'prediction' => 'Vastgezette voorspellingen kunnen niet worden aangepast.',
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
        return $this->is_locked || $this->locked_at !== null;
    }
}
