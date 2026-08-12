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

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_operational_summary(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id, 'status' => 'active']);
        Student::factory()->create(['institute_id' => $institute->id, 'status' => 'inactive']);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create([
            'course_id' => $course->id,
            'status' => 'active',
            'weekdays' => [strtolower(now()->format('l'))],
        ]);
        $enrollment = Enrollment::create([
            'institute_id' => $institute->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => now()->toDateString(),
            'agreed_course_fee' => 1000,
            'admission_fee' => 0,
            'discount_value' => 0,
            'final_course_fee' => 1000,
            'status' => 'active',
        ]);
        $installment = FeeInstallment::create([
            'institute_id' => $institute->id,
            'enrollment_id' => $enrollment->id,
            'title' => 'Monthly Fee',
            'due_date' => now()->subDay()->toDateString(),
            'amount' => 1000,
            'paid_amount' => 250,
            'status' => 'partially_paid',
        ]);

        Payment::create([
            'institute_id' => $institute->id,
            'student_id' => $student->id,
            'enrollment_id' => $enrollment->id,
            'installment_id' => $installment->id,
            'receipt_number' => 'RCP-000001',
            'amount' => 250,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'received_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.kpis.total_students', 2)
            ->assertJsonPath('data.kpis.active_students', 1)
            ->assertJsonPath('data.kpis.active_batches', 1)
            ->assertJsonPath('data.kpis.todays_classes', 1)
            ->assertJsonPath('data.kpis.this_month_collection', '250.00')
            ->assertJsonPath('data.kpis.pending_fees', '750.00')
            ->assertJsonPath('data.pending_fees.0.status', 'overdue')
            ->assertJsonCount(6, 'data.monthly_fee_collection');
    }
}
