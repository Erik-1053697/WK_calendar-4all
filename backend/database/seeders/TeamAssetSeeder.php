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
                    'code' => $asset['fifa_code'],
                    'fifa_code' => $asset['fifa_code'],
                    'country_code' => $asset['country_code'],
                    'image_url' => $this->flagImageUrl($asset['country_code']),
                    'flag_url' => $this->flagImageUrl($asset['country_code']),
                    'confederation' => $this->confederationFor($asset['country_code']),
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

    protected function confederationFor(string $countryCode): string
    {
        $uefa = ['at', 'ba', 'be', 'ch', 'cz', 'de', 'es', 'fr', 'gb-eng', 'gb-sct', 'hr', 'nl', 'no', 'pt', 'se', 'tr'];
        $concacaf = ['ca', 'cw', 'ht', 'mx', 'pa', 'us'];
        $conmebol = ['ar', 'br', 'co', 'ec', 'py', 'uy'];
        $caf = ['ci', 'cv', 'dz', 'eg', 'gh', 'ma', 'sn', 'tn', 'za'];
        $afc = ['au', 'ir', 'iq', 'jo', 'jp', 'kr', 'qa', 'sa', 'uz'];
        $ofc = ['nz'];

        return match (true) {
            in_array($countryCode, $uefa, true) => 'UEFA',
            in_array($countryCode, $concacaf, true) => 'Concacaf',
            in_array($countryCode, $conmebol, true) => 'CONMEBOL',
            in_array($countryCode, $caf, true) => 'CAF',
            in_array($countryCode, $afc, true) => 'AFC',
            in_array($countryCode, $ofc, true) => 'OFC',
            default => 'TBD',
        };
    }
}
