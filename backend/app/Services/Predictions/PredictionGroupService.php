<?php

namespace App\Services\Predictions;

use App\Models\PredictionGroup;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PredictionGroupService
{
    public function create(User $user, Tournament $tournament, string $name): PredictionGroup
    {
        return DB::transaction(function () use ($name, $tournament, $user): PredictionGroup {
            $group = PredictionGroup::query()->create([
                'tournament_id' => $tournament->id,
                'owner_user_id' => $user->id,
                'name' => trim($name),
                'invite_code' => $this->generateUniqueInviteCode(),
            ]);

            $group->members()->attach($user->id, ['role' => 'owner']);

            return $group->load(['owner', 'members']);
        });
    }

    public function join(User $user, string $inviteCode): PredictionGroup
    {
        $normalizedCode = Str::upper(trim($inviteCode));

        $group = PredictionGroup::query()
            ->with(['owner', 'members', 'tournament'])
            ->where('invite_code', $normalizedCode)
            ->first();

        if (! $group) {
            throw ValidationException::withMessages([
                'invite_code' => 'We konden geen voorspellersgroep vinden met deze code.',
            ]);
        }

        if (! $group->members->contains('id', $user->id)) {
            $group->members()->attach($user->id, ['role' => 'member']);
            $group->load('members');
        }

        return $group;
    }

    protected function generateUniqueInviteCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (PredictionGroup::query()->where('invite_code', $code)->exists());

        return $code;
    }
}
