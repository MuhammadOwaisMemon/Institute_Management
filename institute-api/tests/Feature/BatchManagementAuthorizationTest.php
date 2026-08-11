<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_create_batch(): void
    {
        $institute = Institute::factory()->create();
        $receptionist = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'receptionist',
        ]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $teacher = Teacher::factory()->create(['institute_id' => $institute->id]);

        $this->actingAs($receptionist)
            ->postJson('/api/batches', [
                'course_id' => $course->id,
                'teacher_id' => $teacher->id,
                'name' => 'Morning Batch',
                'batch_code' => 'MORN-001',
                'start_date' => '2026-08-11',
                'expected_end_date' => '2026-11-11',
                'start_time' => '09:00',
                'end_time' => '11:00',
                'capacity' => 25,
                'room' => 'Room 1',
                'weekdays' => ['monday', 'wednesday', 'friday'],
                'status' => 'upcoming',
                'notes' => null,
            ])
            ->assertCreated()
            ->assertJsonPath('data.course.id', $course->id);
    }

    public function test_teacher_can_only_view_own_batches(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'teacher',
        ]);
        $teacher = Teacher::factory()->create([
            'institute_id' => $institute->id,
            'user_id' => $user->id,
        ]);
        $ownBatch = Batch::factory()->forInstitute($institute)->create([
            'teacher_id' => $teacher->id,
        ]);
        $otherBatch = Batch::factory()->forInstitute($institute)->create();

        $this->actingAs($user)->getJson("/api/batches/{$ownBatch->id}")->assertOk();
        $this->actingAs($user)->getJson("/api/batches/{$otherBatch->id}")->assertForbidden();
    }

    public function test_batch_validates_capacity_dates_and_time(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'admin',
        ]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);

        $this->actingAs($admin)
            ->postJson('/api/batches', [
                'course_id' => $course->id,
                'name' => 'Bad Batch',
                'start_date' => '2026-08-11',
                'expected_end_date' => '2026-08-10',
                'start_time' => '11:00',
                'end_time' => '09:00',
                'capacity' => 0,
                'weekdays' => [],
                'status' => 'active',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['expected_end_date', 'end_time', 'capacity', 'weekdays']);
    }
}
