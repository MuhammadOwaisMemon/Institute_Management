<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Institute;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_creation_is_audited(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/api/students', [
                'first_name' => 'Ali',
                'last_name' => 'Ahmed',
                'phone' => '03001234567',
                'joining_date' => '2026-08-12',
                'status' => 'active',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('activity_logs', [
            'institute_id' => $institute->id,
            'user_id' => $admin->id,
            'action' => 'student.created',
            'entity_type' => 'Student',
        ]);
    }

    public function test_user_creation_audit_does_not_store_password(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/api/settings/users', [
                'name' => 'Reception Desk',
                'email' => 'desk@example.com',
                'phone' => null,
                'role' => 'receptionist',
                'status' => 'active',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertCreated();

        $log = \App\Models\ActivityLog::where('action', 'user.created')->firstOrFail();
        $this->assertArrayNotHasKey('password', $log->metadata);
        $this->assertSame('desk@example.com', $log->metadata['email']);
    }

    public function test_enrollment_status_change_is_audited_and_logs_are_filterable(): void
    {
        [$admin, $enrollment] = $this->setupEnrollment();

        $this->actingAs($admin)
            ->patchJson("/api/enrollments/{$enrollment->id}/status", [
                'status' => 'completed',
                'completion_date' => '2026-08-20',
            ])
            ->assertOk();

        $this->actingAs($admin)
            ->getJson('/api/settings/activity-logs?action=enrollment.status_changed')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.action', 'enrollment.status_changed')
            ->assertJsonPath('data.0.metadata.status_before', 'active')
            ->assertJsonPath('data.0.metadata.status_after', 'completed');
    }

    public function test_activity_log_is_admin_only(): void
    {
        $institute = Institute::factory()->create();
        $receptionist = User::factory()->create(['institute_id' => $institute->id, 'role' => 'receptionist']);

        $this->actingAs($receptionist)
            ->getJson('/api/settings/activity-logs')
            ->assertForbidden();
    }

    private function setupEnrollment(): array
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);
        $enrollment = Enrollment::create([
            'institute_id' => $institute->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-01',
            'agreed_course_fee' => 1000,
            'admission_fee' => 0,
            'discount_value' => 0,
            'final_course_fee' => 1000,
            'status' => 'active',
        ]);

        return [$admin, $enrollment];
    }
}
