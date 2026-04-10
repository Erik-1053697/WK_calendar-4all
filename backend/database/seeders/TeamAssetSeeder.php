<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamAssetSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array<string, array{fifa_code: string, country_code: string}> $assets */
        $assets = require database_path('seeders/Data/team_assets.php');

        foreach ($assets as $teamName => $asset) {
            Team::query()
                ->where('name', $teamName)
                ->update([
                    'fifa_code' => $asset['fifa_code'],
                    'country_code' => $asset['country_code'],
                    'image_url' => $this->flagImageUrl($asset['country_code']),
                ]);
        }
    }

    protected function flagImageUrl(string $countryCode): string
    {
        return sprintf(
            'https://cdn.jsdelivr.net/npm/flag-icons/flags/4x3/%s.svg',
            strtolower($countryCode),
        );
    }
}
