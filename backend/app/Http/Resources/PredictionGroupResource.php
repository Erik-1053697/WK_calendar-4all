<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PredictionGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $memberCount = $this->relationLoaded('members') ? $this->members->count() : (int) ($this->members_count ?? 0);
        $isOwner = $request->user() ? (int) $this->owner_user_id === (int) $request->user()->id : false;

        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'name' => $this->name,
            'invite_code' => $this->invite_code,
            'owner_user_id' => $this->owner_user_id,
            'owner_name' => $this->relationLoaded('owner') && $this->owner ? $this->owner->name : null,
            'member_count' => $memberCount,
            'is_owner' => $isOwner,
            'members' => $this->relationLoaded('members')
                ? $this->members->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'avatar_url' => $member->avatar_url,
                    'role' => $member->pivot?->role ?? 'member',
                ])->values()
                : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
