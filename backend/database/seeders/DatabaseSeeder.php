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
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@wkcalendar.test',
            'password' => 'password',
            'is_admin' => true,
        ]);

        $this->call(WorldCupMatchSeeder::class);
    }
}
