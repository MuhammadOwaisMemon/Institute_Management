<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinalEndToEndFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_complete_full_student_to_certificate_flow(): void
    {
        $institute = Institute::factory()->create([
            'name' => 'Bright Future Institute',
            'currency' => 'PKR',
        ]);

        User::factory()->create([
            'institute_id' => $institute->id,
            'name' => 'Hina Javed',
            'email' => 'receptionist@example.test',
            'password' => 'password123',
            'role' => 'receptionist',
            'status' => 'active',
        ]);

        $course = Course::create([
            'institute_id' => $institute->id,
            'name' => 'Web Development',
            'code' => 'WEB-DEV',
            'description' => 'Frontend and backend development basics.',
            'duration_value' => 6,
            'duration_unit' => 'months',
            'standard_fee' => 18000,
            'admission_fee' => 1000,
            'status' => 'active',
        ]);

        $batch = Batch::create([
            'institute_id' => $institute->id,
            'course_id' => $course->id,
            'name' => 'Web Development Evening',
            'batch_code' => 'WEB-EVE-26',
            'start_date' => '2026-08-01',
            'expected_end_date' => '2026-12-31',
            'start_time' => '18:00',
            'end_time' => '20:00',
            'capacity' => 25,
            'room' => 'Lab 1',
            'weekdays' => ['monday', 'wednesday', 'friday'],
            'status' => 'active',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'receptionist@example.test',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.email', 'receptionist@example.test');

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure(['data' => ['kpis', 'today_classes', 'recent_admissions', 'recent_payments', 'pending_fees', 'monthly_fee_collection']]);

        $studentId = $this->postJson('/api/students', [
            'first_name' => 'Zain',
            'last_name' => 'Khan',
            'father_guardian_name' => 'Rashid Khan',
            'gender' => 'male',
            'phone' => '0300 555 1234',
            'guardian_phone' => '0301 555 1234',
            'email' => 'zain.khan@example.test',
            'address' => 'Gulshan-e-Iqbal',
            'city' => 'Karachi',
            'joining_date' => '2026-08-01',
            'status' => 'active',
        ])->assertCreated()
            ->assertJsonPath('data.student_code', 'STD-00001')
            ->json('data.id');

        $enrollmentId = $this->postJson('/api/enrollments', [
            'student_id' => $studentId,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => '2026-08-01',
            'agreed_course_fee' => 18000,
            'admission_fee' => 1000,
            'discount_type' => 'fixed',
            'discount_value' => 1000,
            'status' => 'active',
            'notes' => 'Final review admission.',
        ])->assertCreated()
            ->assertJsonPath('data.final_course_fee', '18000.00')
            ->json('data.id');

        $firstInstallmentId = $this->postJson('/api/fees/installments', [
            'enrollment_id' => $enrollmentId,
            'title' => 'Admission Installment',
            'due_date' => '2026-08-05',
            'amount' => 9000,
        ])->assertCreated()->json('data.id');

        $this->postJson('/api/fees/installments', [
            'enrollment_id' => $enrollmentId,
            'title' => 'Final Installment',
            'due_date' => '2026-09-05',
            'amount' => 9000,
        ])->assertCreated();

        $paymentId = $this->postJson('/api/payments', [
            'enrollment_id' => $enrollmentId,
            'installment_id' => $firstInstallmentId,
            'amount' => 9000,
            'payment_date' => '2026-08-02',
            'payment_method' => 'cash',
        ])->assertCreated()
            ->assertJsonPath('data.receipt_number', 'RCP-000001')
            ->json('data.id');

        $this->getJson("/api/payments/{$paymentId}")
            ->assertOk()
            ->assertJsonPath('data.payment.receipt_number', 'RCP-000001')
            ->assertJsonPath('data.remaining_balance', '9000.00');

        $this->postJson('/api/payments', [
            'enrollment_id' => $enrollmentId,
            'amount' => 9000,
            'payment_date' => '2026-08-15',
            'payment_method' => 'bank_transfer',
            'reference_number' => 'BFI-TRX-1001',
        ])->assertCreated()
            ->assertJsonPath('data.receipt_number', 'RCP-000002');

        $this->getJson("/api/enrollments/{$enrollmentId}/outstanding")
            ->assertOk()
            ->assertJsonPath('data.total_paid', '18000.00')
            ->assertJsonPath('data.remaining_balance', '0.00');

        $this->postJson('/api/attendance', [
            'batch_id' => $batch->id,
            'attendance_date' => '2026-08-12',
            'records' => [
                ['student_id' => $studentId, 'status' => 'present', 'remarks' => 'On time'],
            ],
        ])->assertOk();

        $examId = $this->postJson('/api/exams', [
            'batch_id' => $batch->id,
            'title' => 'Final Practical',
            'exam_date' => '2026-08-20',
            'total_marks' => 100,
            'passing_marks' => 50,
            'status' => 'completed',
        ])->assertCreated()->json('data.id');

        $this->postJson("/api/exams/{$examId}/results", [
            'records' => [
                ['student_id' => $studentId, 'obtained_marks' => 84, 'grade' => 'A', 'remarks' => 'Strong final project.'],
            ],
        ])->assertOk()
            ->assertJsonPath('data.0.percentage', '84.00');

        $this->postJson('/api/certificates', [
            'enrollment_id' => $enrollmentId,
            'issue_date' => '2026-08-25',
            'completion_date' => '2026-08-24',
        ])->assertUnprocessable();

        $this->patchJson("/api/enrollments/{$enrollmentId}/status", [
            'status' => 'completed',
            'completion_date' => '2026-08-24',
        ])->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $certificateId = $this->postJson('/api/certificates', [
            'enrollment_id' => $enrollmentId,
            'issue_date' => '2026-08-25',
            'completion_date' => '2026-08-24',
            'remarks' => 'Completed all course requirements.',
        ])->assertCreated()
            ->assertJsonPath('data.certificate_number', 'CERT-2026-00001')
            ->json('data.id');

        $this->getJson("/api/certificates/{$certificateId}")
            ->assertOk()
            ->assertJsonPath('data.certificate.student_id', $studentId)
            ->assertJsonPath('data.institute.name', 'Bright Future Institute');
    }
}
