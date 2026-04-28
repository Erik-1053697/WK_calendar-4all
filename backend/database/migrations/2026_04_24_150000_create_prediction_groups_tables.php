<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_groups', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('invite_code', 16)->unique();
            $table->timestamps();
        });

        Schema::create('prediction_group_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('prediction_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 24)->default('member');
            $table->timestamps();

            $table->unique(['prediction_group_id', 'user_id'], 'unique_prediction_group_member');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_group_members');
        Schema::dropIfExists('prediction_groups');
    }
};
