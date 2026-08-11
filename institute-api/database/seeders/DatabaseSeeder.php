<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Institute;
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
        // User::factory(10)->create();

        $institute = Institute::query()->firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Institute Name',
                'country' => 'Pakistan',
                'currency' => 'PKR',
                'timezone' => 'Asia/Karachi',
                'status' => 'active',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'institute_id' => $institute->id,
                'name' => 'Admin User',
                'role' => 'admin',
                'status' => 'active',
                'password' => 'password',
            ],
        );

        collect([
            ['name' => 'Spoken English', 'code' => 'ENG-SPOKEN', 'standard_fee' => 12000],
            ['name' => 'IELTS Preparation', 'code' => 'IELTS', 'standard_fee' => 25000],
            ['name' => 'Basic Computer', 'code' => 'COMP-BASIC', 'standard_fee' => 10000],
            ['name' => 'MS Office', 'code' => 'MS-OFFICE', 'standard_fee' => 15000],
            ['name' => 'Graphic Designing', 'code' => 'GD', 'standard_fee' => 30000],
            ['name' => 'Web Development', 'code' => 'WEB-DEV', 'standard_fee' => 45000],
        ])->each(function (array $course) use ($institute): void {
            Course::query()->updateOrCreate(
                [
                    'institute_id' => $institute->id,
                    'code' => $course['code'],
                ],
                [
                    'name' => $course['name'],
                    'description' => null,
                    'duration_value' => null,
                    'duration_unit' => null,
                    'standard_fee' => $course['standard_fee'],
                    'admission_fee' => 0,
                    'status' => 'active',
                ],
            );
        });
    }
}
