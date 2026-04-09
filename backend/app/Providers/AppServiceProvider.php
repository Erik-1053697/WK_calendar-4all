<?php

namespace App\Providers;

use App\Models\TournamentMatch;
use App\Policies\TournamentMatchPolicy;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::policy(TournamentMatch::class, TournamentMatchPolicy::class);
    }
}
