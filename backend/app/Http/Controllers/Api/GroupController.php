<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupStandingsResource;
use App\Services\Standings\GroupStandingsService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GroupController extends Controller
{
    public function standings(GroupStandingsService $groupStandingsService): AnonymousResourceCollection
    {
        return GroupStandingsResource::collection($groupStandingsService->build());
    }
}
