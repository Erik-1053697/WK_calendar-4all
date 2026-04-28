<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PredictionGroup extends Model
{
    protected $fillable = [
        'tournament_id',
        'owner_user_id',
        'name',
        'invite_code',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'prediction_group_members')
            ->withPivot('role')
            ->withTimestamps()
            ->orderBy('name');
    }
}
