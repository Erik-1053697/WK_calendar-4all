<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('fifa_match_number')->unique();
            $table->string('stage');
            $table->string('group_name')->nullable();
            $table->date('match_date');
            $table->dateTime('kickoff_at_local');
            $table->string('timezone_name')->nullable();
            $table->dateTime('kickoff_at_utc')->nullable();
            $table->foreignId('venue_id')->constrained()->cascadeOnDelete();
            $table->string('home_team_name');
            $table->string('away_team_name');
            $table->string('home_team_slot', 32)->nullable();
            $table->string('away_team_slot', 32)->nullable();
            $table->unsignedInteger('round_order');
            $table->unsignedInteger('match_order');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->index(['match_date', 'venue_id']);
            $table->index(['stage', 'round_order']);
            $table->index(['kickoff_at_local']);
            $table->index(['kickoff_at_utc']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
