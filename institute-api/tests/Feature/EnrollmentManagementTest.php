<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_enroll_existing_student_and_fee_is_snapshotted(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'receptionist']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id, 'standard_fee' => 10000, 'admission_fee' => 1000]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        $this->actingAs($user)->postJson('/api/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-11',
            'agreed_course_fee' => 10000,
            'admission_fee' => 1000,
            'discount_type' => 'fixed',
            'discount_value' => 500,
            'status' => 'active',
        ])->assertCreated()->assertJsonPath('data.final_course_fee', '10500.00');
    }

    public function test_duplicate_active_enrollment_in_same_batch_is_blocked(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        $payload = ['student_id' => $student->id, 'course_id' => $course->id, 'batch_id' => $batch->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'status' => 'active'];
        $this->actingAs($user)->postJson('/api/enrollments', $payload)->assertCreated();
        $this->actingAs($user)->postJson('/api/enrollments', $payload)->assertUnprocessable();
    }

    public function test_percentage_discount_calculates_final_payable(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        $this->actingAs($user)->postJson('/api/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-11',
            'agreed_course_fee' => 10000,
            'admission_fee' => 1000,
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'status' => 'active',
        ])->assertCreated()->assertJsonPath('data.final_course_fee', '9900.00');
    }

    public function test_discount_cannot_exceed_total_fee(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        $this->actingAs($user)->postJson('/api/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-11',
            'agreed_course_fee' => 1000,
            'admission_fee' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 1001,
            'status' => 'active',
        ])->assertUnprocessable()->assertJsonValidationErrors(['discount_value']);
    }
}
