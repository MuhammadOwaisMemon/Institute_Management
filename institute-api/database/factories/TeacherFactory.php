<?php

namespace Database\Factories;

use App\Models\Institute;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Teacher>
 */
class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'institute_id' => Institute::factory(),
            'employee_code' => fake()->unique()->bothify('TCH-###'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'gender' => fake()->randomElement(['male', 'female']),
            'phone' => fake()->numerify('03#########'),
            'email' => fake()->safeEmail(),
            'cnic' => fake()->numerify('#####-#######-#'),
            'address' => fake()->address(),
            'joining_date' => fake()->date(),
            'status' => 'active',
            'notes' => null,
        ];
    }
}
