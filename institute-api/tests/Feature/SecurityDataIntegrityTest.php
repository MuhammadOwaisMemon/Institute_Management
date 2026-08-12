<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Institute;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityDataIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_student_enrollment_is_scoped_to_current_institute(): void
    {
        [$institute, $user] = $this->userForInstitute();
        $otherInstitute = Institute::factory()->create();
        $otherStudent = Student::factory()->create(['institute_id' => $otherInstitute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        $this->actingAs($user)->postJson('/api/enrollments', [
            'student_id' => $otherStudent->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-12',
            'agreed_course_fee' => 1000,
            'admission_fee' => 0,
            'status' => 'active',
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('enrollments', [
            'institute_id' => $institute->id,
            'student_id' => $otherStudent->id,
        ]);
    }

    public function test_attendance_rejects_students_not_enrolled_in_selected_batch(): void
    {
        [$institute, $user] = $this->userForInstitute();
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create();

        $this->actingAs($user)->postJson('/api/attendance', [
            'batch_id' => $batch->id,
            'attendance_date' => '2026-08-12',
            'records' => [
                ['student_id' => $student->id, 'status' => 'present'],
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_payment_cannot_be_applied_to_installment_from_another_enrollment(): void
    {
        [$institute, $user] = $this->userForInstitute();
        $first = $this->enrollmentFor($institute);
        $second = $this->enrollmentFor($institute);
        $installment = FeeInstallment::create([
            'institute_id' => $institute->id,
            'enrollment_id' => $second->id,
            'title' => 'Full',
            'due_date' => '2026-08-20',
            'amount' => 1000,
            'status' => 'pending',
        ]);

        $this->actingAs($user)->postJson('/api/payments', [
            'enrollment_id' => $first->id,
            'installment_id' => $installment->id,
            'amount' => 100,
            'payment_date' => '2026-08-12',
            'payment_method' => 'cash',
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('payments', [
            'enrollment_id' => $first->id,
            'installment_id' => $installment->id,
        ]);
    }

    public function test_pending_fee_report_ignores_cross_institute_malformed_payments(): void
    {
        [$institute, $user] = $this->userForInstitute();
        $otherInstitute = Institute::factory()->create();
        $otherUser = User::factory()->create(['institute_id' => $otherInstitute->id, 'role' => 'admin']);
        $enrollment = $this->enrollmentFor($institute, finalFee: 1000);

        Payment::create([
            'institute_id' => $otherInstitute->id,
            'student_id' => $enrollment->student_id,
            'enrollment_id' => $enrollment->id,
            'receipt_number' => 'RCP-000001',
            'amount' => 1000,
            'payment_date' => '2026-08-12',
            'payment_method' => 'cash',
            'received_by' => $otherUser->id,
        ]);

        $this->actingAs($user)->getJson('/api/reports/pending-fees')
            ->assertOk()
            ->assertJsonPath('meta.total_remaining', '1000.00')
            ->assertJsonPath('data.0.remaining', '1000.00');
    }

    public function test_student_history_endpoints_do_not_accept_other_institute_student_ids(): void
    {
        [$institute, $user] = $this->userForInstitute();
        $otherInstitute = Institute::factory()->create();
        $otherStudent = Student::factory()->create(['institute_id' => $otherInstitute->id]);

        $this->actingAs($user)->getJson("/api/attendance/students/{$otherStudent->id}/history")->assertNotFound();
        $this->actingAs($user)->getJson("/api/students/{$otherStudent->id}/results")->assertNotFound();
        $this->actingAs($user)->getJson("/api/students/{$otherStudent->id}/certificates")->assertNotFound();

        $this->assertSame($institute->id, $user->institute_id);
    }

    private function userForInstitute(): array
    {
        $institute = Institute::factory()->create();

        return [$institute, User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'admin',
        ])];
    }

    private function enrollmentFor(Institute $institute, int $finalFee = 1000): Enrollment
    {
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);
        $student = Student::factory()->create(['institute_id' => $institute->id]);

        return Enrollment::create([
            'institute_id' => $institute->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-01',
            'agreed_course_fee' => $finalFee,
            'admission_fee' => 0,
            'discount_value' => 0,
            'final_course_fee' => $finalFee,
            'status' => 'active',
        ]);
    }
}
