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

class ReportManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_fee_and_pending_reports_return_totals_and_csv(): void
    {
        [$admin, $enrollment, $installment] = $this->setupEnrollment();

        Payment::create([
            'institute_id' => $admin->institute_id,
            'student_id' => $enrollment->student_id,
            'enrollment_id' => $enrollment->id,
            'installment_id' => $installment->id,
            'receipt_number' => 'RCP-000001',
            'amount' => 400,
            'payment_date' => '2026-08-12',
            'payment_method' => 'cash',
            'received_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/reports/fee-collection?date_from=2026-08-01&date_to=2026-08-31&payment_method=cash')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.total_amount', '400.00')
            ->assertJsonPath('data.0.receipt_number', 'RCP-000001');

        $this->actingAs($admin)
            ->getJson('/api/reports/pending-fees')
            ->assertOk()
            ->assertJsonPath('meta.total_remaining', '600.00')
            ->assertJsonPath('data.0.remaining', '600.00');

        $this->actingAs($admin)
            ->get('/api/reports/fee-collection/export?payment_method=cash')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_teacher_cannot_access_reports(): void
    {
        $institute = Institute::factory()->create();
        $teacher = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);

        $this->actingAs($teacher)
            ->getJson('/api/reports/students')
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
        $installment = FeeInstallment::create([
            'institute_id' => $institute->id,
            'enrollment_id' => $enrollment->id,
            'title' => 'Full Fee',
            'due_date' => '2026-08-20',
            'amount' => 1000,
            'paid_amount' => 400,
            'status' => 'partially_paid',
        ]);

        return [$admin, $enrollment, $installment];
    }
}
