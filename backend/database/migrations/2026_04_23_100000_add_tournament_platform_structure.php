<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedSmallInteger('year');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('upcoming');
            $table->timestamps();

            $table->unique(['name', 'year']);
            $table->index(['year', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->foreignId('tournament_id')->nullable()->after('id')->constrained('tournaments')->nullOnDelete();
            $table->index(['tournament_id', 'display_order']);
        });

        Schema::table('venues', function (Blueprint $table) {
            $table->foreignId('tournament_id')->nullable()->after('id')->constrained('tournaments')->nullOnDelete();
            $table->unsignedInteger('capacity')->nullable()->after('stadium_name');
            $table->index(['tournament_id', 'display_order']);
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->string('code', 8)->nullable()->unique()->after('name');
            $table->string('flag_url')->nullable()->after('image_url');
            $table->string('confederation', 32)->nullable()->after('flag_url');
        });

        Schema::create('group_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['group_id', 'team_id']);
            $table->index(['group_id', 'sort_order']);
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->foreignId('tournament_id')->nullable()->after('id')->constrained('tournaments')->nullOnDelete();
            $table->string('round_label')->nullable()->after('stage');
            $table->unsignedSmallInteger('matchday')->nullable()->after('match_order');
            $table->index(['tournament_id', 'status']);
            $table->index(['tournament_id', 'stage', 'matchday']);
        });

        Schema::create('standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->unsignedSmallInteger('played')->default(0);
            $table->unsignedSmallInteger('wins')->default(0);
            $table->unsignedSmallInteger('draws')->default(0);
            $table->unsignedSmallInteger('losses')->default(0);
            $table->unsignedSmallInteger('goals_for')->default(0);
            $table->unsignedSmallInteger('goals_against')->default(0);
            $table->integer('goal_difference')->default(0);
            $table->unsignedSmallInteger('points')->default(0);
            $table->unsignedSmallInteger('rank')->default(1);
            $table->string('qualification_status')->default('undecided');
            $table->timestamps();

            $table->unique(['group_id', 'team_id']);
            $table->index(['group_id', 'rank']);
        });

        Schema::table('predictions', function (Blueprint $table) {
            $table->unsignedSmallInteger('points_awarded')->nullable()->after('predicted_away_score');
            $table->boolean('is_locked')->default(false)->after('locked_at');
            $table->index(['user_id', 'points_awarded']);
        });

        Schema::create('leaderboard_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('rank')->default(1);
            $table->timestamps();

            $table->unique(['user_id', 'tournament_id']);
            $table->index(['tournament_id', 'rank']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_entries');

        Schema::table('predictions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'points_awarded']);
            $table->dropColumn(['points_awarded', 'is_locked']);
        });

        Schema::dropIfExists('standings');

        Schema::table('matches', function (Blueprint $table) {
            $table->dropIndex(['tournament_id', 'status']);
            $table->dropIndex(['tournament_id', 'stage', 'matchday']);
            $table->dropConstrainedForeignId('tournament_id');
            $table->dropColumn(['round_label', 'matchday']);
        });

        Schema::dropIfExists('group_teams');

        Schema::table('teams', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'flag_url', 'confederation']);
        });

        Schema::table('venues', function (Blueprint $table) {
            $table->dropIndex(['tournament_id', 'display_order']);
            $table->dropConstrainedForeignId('tournament_id');
            $table->dropColumn('capacity');
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->dropIndex(['tournament_id', 'display_order']);
            $table->dropConstrainedForeignId('tournament_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_url');
        });

        Schema::dropIfExists('tournaments');
    }
};
