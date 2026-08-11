<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Batch>
 */
class BatchFactory extends Factory
{
    protected $model = Batch::class;

    public function definition(): array
    {
        return [
            'institute_id' => Institute::factory(),
            'course_id' => Course::factory(),
            'teacher_id' => null,
            'name' => fake()->randomElement(['Morning Batch', 'Evening Batch', 'Weekend Batch']),
            'batch_code' => fake()->unique()->bothify('BAT-###'),
            'start_date' => now()->toDateString(),
            'expected_end_date' => now()->addMonths(3)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'capacity' => 25,
            'room' => 'Room 1',
            'weekdays' => ['monday', 'wednesday', 'friday'],
            'status' => 'upcoming',
            'notes' => null,
        ];
    }

    public function forInstitute(Institute $institute): static
    {
        return $this->state(fn () => [
            'institute_id' => $institute->id,
            'course_id' => Course::factory()->state(['institute_id' => $institute->id]),
            'teacher_id' => Teacher::factory()->state(['institute_id' => $institute->id]),
        ]);
    }
}
