<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'institute_id' => Institute::factory(),
            'name' => fake()->words(2, true),
            'code' => fake()->unique()->bothify('CRS-###'),
            'description' => fake()->sentence(),
            'duration_value' => fake()->numberBetween(1, 12),
            'duration_unit' => fake()->randomElement(['days', 'weeks', 'months']),
            'standard_fee' => fake()->numberBetween(5000, 50000),
            'admission_fee' => fake()->numberBetween(0, 5000),
            'status' => 'active',
        ];
    }
}
