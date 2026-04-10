<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'name',
        'country',
        'timezone_name',
        'display_order',
    ];

    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }
}
