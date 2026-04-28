<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_winner_predictions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('predicted_team_id')->constrained('teams')->cascadeOnDelete();
            $table->unsignedInteger('points_awarded')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'tournament_id'], 'unique_user_tournament_winner_prediction');
        });

        Schema::create('group_winner_predictions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('predicted_team_id')->constrained('teams')->cascadeOnDelete();
            $table->unsignedInteger('points_awarded')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'group_id'], 'unique_user_group_winner_prediction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_winner_predictions');
        Schema::dropIfExists('tournament_winner_predictions');
    }
};
