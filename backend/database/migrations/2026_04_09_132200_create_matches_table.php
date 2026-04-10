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
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->date('match_date');
            $table->dateTime('kickoff_at_local');
            $table->string('timezone_name')->nullable();
            $table->dateTime('kickoff_at_utc')->nullable();
            $table->foreignId('venue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('home_team_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignId('away_team_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignId('winner_team_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->string('home_team_name');
            $table->string('away_team_name');
            $table->string('home_team_slot', 32)->nullable();
            $table->string('away_team_slot', 32)->nullable();
            $table->string('status')->default('scheduled');
            $table->unsignedTinyInteger('home_score')->nullable();
            $table->unsignedTinyInteger('away_score')->nullable();
            $table->unsignedTinyInteger('home_points_awarded')->nullable();
            $table->unsignedTinyInteger('away_points_awarded')->nullable();
            $table->timestamp('result_entered_at')->nullable();
            $table->foreignId('result_entered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('round_order');
            $table->unsignedInteger('match_order');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->index(['match_date', 'venue_id']);
            $table->index(['stage', 'round_order']);
            $table->index(['group_id', 'match_date']);
            $table->index(['status']);
            $table->index(['kickoff_at_local']);
            $table->index(['kickoff_at_utc']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
