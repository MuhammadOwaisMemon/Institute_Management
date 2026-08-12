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

class FeeInstallmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_installment_can_be_created_for_active_enrollment(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'receptionist']);
        $enrollment = Enrollment::create(['institute_id' => $institute->id, 'student_id' => Student::factory()->create(['institute_id' => $institute->id])->id, 'course_id' => Course::factory()->create(['institute_id' => $institute->id])->id, 'batch_id' => Batch::factory()->forInstitute($institute)->create()->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'discount_value' => 0, 'final_course_fee' => 1000, 'status' => 'active']);

        $this->actingAs($user)->postJson('/api/fees/installments', [
            'enrollment_id' => $enrollment->id,
            'title' => 'First Installment',
            'due_date' => '2026-08-20',
            'amount' => 500,
        ])->assertCreated()
            ->assertJsonPath('data.title', 'First Installment')
            ->assertJsonPath('data.amount', '500.00')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('fee_installments', [
            'enrollment_id' => $enrollment->id,
            'amount' => 500,
            'paid_amount' => 0,
            'status' => 'pending',
        ]);
    }

    public function test_installments_cannot_exceed_final_payable(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $enrollment = Enrollment::create(['institute_id' => $institute->id, 'student_id' => Student::factory()->create(['institute_id' => $institute->id])->id, 'course_id' => Course::factory()->create(['institute_id' => $institute->id])->id, 'batch_id' => Batch::factory()->forInstitute($institute)->create()->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'discount_value' => 0, 'final_course_fee' => 1000, 'status' => 'active']);

        $this->actingAs($user)->postJson('/api/fees/installments', ['enrollment_id' => $enrollment->id, 'title' => 'Full Fee', 'due_date' => '2026-08-20', 'amount' => 1200])->assertUnprocessable();
    }

    public function test_past_pending_installment_becomes_overdue_on_listing(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'receptionist']);
        $enrollment = Enrollment::create(['institute_id' => $institute->id, 'student_id' => Student::factory()->create(['institute_id' => $institute->id])->id, 'course_id' => Course::factory()->create(['institute_id' => $institute->id])->id, 'batch_id' => Batch::factory()->forInstitute($institute)->create()->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'discount_value' => 0, 'final_course_fee' => 1000, 'status' => 'active']);
        $this->actingAs($user)->postJson('/api/fees/installments', ['enrollment_id' => $enrollment->id, 'title' => 'Late Fee', 'due_date' => '2020-01-01', 'amount' => 500])->assertCreated();

        $this->actingAs($user)->getJson('/api/fees?status=overdue')->assertOk()->assertJsonPath('data.0.status', 'overdue');
    }

    public function test_enrollment_fee_summary_returns_totals(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $enrollment = Enrollment::create(['institute_id' => $institute->id, 'student_id' => Student::factory()->create(['institute_id' => $institute->id])->id, 'course_id' => Course::factory()->create(['institute_id' => $institute->id])->id, 'batch_id' => Batch::factory()->forInstitute($institute)->create()->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'discount_value' => 0, 'final_course_fee' => 1000, 'status' => 'active']);

        $this->actingAs($user)->postJson('/api/fees/installments', ['enrollment_id' => $enrollment->id, 'title' => 'First', 'due_date' => '2026-08-20', 'amount' => 400])->assertCreated();

        $this->actingAs($user)->getJson("/api/enrollments/{$enrollment->id}/fees")
            ->assertOk()
            ->assertJsonPath('data.total_fee', '1000.00')
            ->assertJsonPath('data.remaining_balance', '1000.00');
    }

    public function test_installment_cannot_be_created_for_inactive_enrollment(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $enrollment = Enrollment::create(['institute_id' => $institute->id, 'student_id' => Student::factory()->create(['institute_id' => $institute->id])->id, 'course_id' => Course::factory()->create(['institute_id' => $institute->id])->id, 'batch_id' => Batch::factory()->forInstitute($institute)->create()->id, 'enrollment_date' => '2026-08-11', 'agreed_course_fee' => 1000, 'admission_fee' => 0, 'discount_value' => 0, 'final_course_fee' => 1000, 'status' => 'cancelled']);

        $this->actingAs($user)->postJson('/api/fees/installments', [
            'enrollment_id' => $enrollment->id,
            'title' => 'Blocked',
            'due_date' => '2026-08-20',
            'amount' => 100,
        ])->assertUnprocessable()->assertJsonValidationErrors(['enrollment_id']);

        $this->assertDatabaseMissing('fee_installments', [
            'enrollment_id' => $enrollment->id,
            'title' => 'Blocked',
        ]);
    }
}
