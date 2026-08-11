<?php

namespace Database\Factories;

use App\Models\Institute;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Institute>
 */
class InstituteFactory extends Factory
{
    protected $model = Institute::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'short_name' => Str::limit($name, 20, ''),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'address' => fake()->address(),
            'city' => 'Karachi',
            'country' => 'Pakistan',
            'currency' => 'PKR',
            'timezone' => 'Asia/Karachi',
            'status' => 'active',
        ];
    }
}
