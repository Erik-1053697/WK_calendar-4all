<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupStandingsResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'code' => $this['code'],
            'name' => $this['name'],
            'played_matches' => $this['played_matches'],
            'is_ranked_by_points' => $this['is_ranked_by_points'],
            'standings' => collect($this['standings'])
                ->map(fn (array $row) => [
                    'position' => $row['position'],
                    'team_id' => $row['team_id'],
                    'team_name' => $row['team_name'],
                    'code' => $row['code'],
                    'fifa_code' => $row['fifa_code'],
                    'country_code' => $row['country_code'],
                    'image_url' => $row['image_url'],
                    'flag_url' => $row['flag_url'],
                    'confederation' => $row['confederation'],
                    'group_slot' => $row['group_slot'],
                    'played' => $row['played'],
                    'won' => $row['won'],
                    'drawn' => $row['drawn'],
                    'lost' => $row['lost'],
                    'goals_for' => $row['goals_for'],
                    'goals_against' => $row['goals_against'],
                    'goal_difference' => $row['goal_difference'],
                    'points' => $row['points'],
                    'qualification_status' => $row['qualification_status'],
                ])
                ->values(),
        ];
    }
}
