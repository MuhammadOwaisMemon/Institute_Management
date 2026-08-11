<?php

namespace Database\Factories;

use App\Models\Institute;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'institute_id' => Institute::factory(),
            'student_code' => fake()->unique()->numerify('STD-#####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'father_guardian_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female']),
            'date_of_birth' => fake()->date(),
            'cnic_bform' => fake()->numerify('#####-#######-#'),
            'phone' => fake()->numerify('03#########'),
            'email' => fake()->safeEmail(),
            'city' => 'Karachi',
            'joining_date' => now()->toDateString(),
            'status' => 'active',
        ];
    }
}
