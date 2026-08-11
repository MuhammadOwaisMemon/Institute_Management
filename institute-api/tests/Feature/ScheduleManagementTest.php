<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_reports_teacher_and_room_conflicts(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $teacher = Teacher::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);

        Batch::factory()->forInstitute($institute)->create([
            'course_id' => $course->id,
            'teacher_id' => $teacher->id,
            'name' => 'Morning Batch',
            'weekdays' => ['monday', 'wednesday'],
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room' => 'Room 2',
            'status' => 'active',
        ]);
        Batch::factory()->forInstitute($institute)->create([
            'course_id' => $course->id,
            'teacher_id' => $teacher->id,
            'name' => 'Overlap Batch',
            'weekdays' => ['monday'],
            'start_time' => '09:30',
            'end_time' => '10:30',
            'room' => 'Room 2',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/schedule?day=monday')
            ->assertOk()
            ->assertJsonCount(2, 'data.conflicts')
            ->assertJsonPath('data.conflicts.0.type', 'teacher')
            ->assertJsonPath('data.conflicts.1.type', 'room');
    }

    public function test_teacher_schedule_only_includes_assigned_batches(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);
        $teacher = Teacher::factory()->create(['institute_id' => $institute->id, 'user_id' => $user->id]);

        $ownBatch = Batch::factory()->forInstitute($institute)->create(['teacher_id' => $teacher->id, 'status' => 'active']);
        Batch::factory()->forInstitute($institute)->create(['status' => 'active']);

        $this->actingAs($user)
            ->getJson('/api/schedule')
            ->assertOk()
            ->assertJsonCount(1, 'data.teacher_schedule.0.classes')
            ->assertJsonPath('data.teacher_schedule.0.classes.0.id', $ownBatch->id);
    }
}
