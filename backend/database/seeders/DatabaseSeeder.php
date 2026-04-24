<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@wkcalendar.test',
            'password' => 'password',
            'avatar_url' => 'https://api.dicebear.com/9.x/initials/svg?seed=Demo%20User',
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@wkcalendar.test',
            'password' => 'password',
            'avatar_url' => 'https://api.dicebear.com/9.x/initials/svg?seed=Admin%20User',
            'is_admin' => true,
        ]);

        $this->call([
            WorldCupMatchSeeder::class,
            TeamAssetSeeder::class,
            PlatformStructureSeeder::class,
        ]);
    }
}
