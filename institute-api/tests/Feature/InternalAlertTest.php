<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Institute;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternalAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_alerts_include_fees_and_batches_and_can_be_marked_read(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id, 'first_name' => 'Ali']);
        $course = Course::factory()->create(['institute_id' => $institute->id, 'name' => 'Spoken English']);
        $batch = Batch::factory()->forInstitute($institute)->create([
            'course_id' => $course->id,
            'name' => 'Evening Batch',
            'status' => 'active',
            'start_date' => now()->addDays(2)->toDateString(),
            'expected_end_date' => now()->addDays(10)->toDateString(),
        ]);
        $enrollment = Enrollment::create([
            'institute_id' => $institute->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_date' => now()->subMonth()->toDateString(),
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
            'paid_amount' => 200,
            'status' => 'overdue',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/alerts')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 3)
            ->assertJsonFragment(['key' => "fee-overdue-{$installment->id}"])
            ->assertJsonFragment(['key' => "batch-starting-{$batch->id}"])
            ->assertJsonFragment(['key' => "batch-completing-{$batch->id}"]);

        $this->actingAs($admin)
            ->postJson('/api/alerts/read', ['key' => "fee-overdue-{$installment->id}"])
            ->assertOk();

        $this->actingAs($admin)
            ->getJson('/api/alerts')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 2);
    }

    public function test_teacher_alerts_only_include_assigned_batch_alerts(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);
        $teacher = Teacher::factory()->create(['institute_id' => $institute->id, 'user_id' => $user->id]);
        $ownBatch = Batch::factory()->forInstitute($institute)->create([
            'teacher_id' => $teacher->id,
            'name' => 'Own Batch',
            'status' => 'active',
            'start_date' => now()->subMonth()->toDateString(),
            'expected_end_date' => now()->addDays(5)->toDateString(),
        ]);
        Batch::factory()->forInstitute($institute)->create([
            'name' => 'Other Batch',
            'status' => 'active',
            'start_date' => now()->subMonth()->toDateString(),
            'expected_end_date' => now()->addDays(5)->toDateString(),
        ]);

        $this->actingAs($user)
            ->getJson('/api/alerts')
            ->assertOk()
            ->assertJsonCount(1, 'data.alerts')
            ->assertJsonPath('data.alerts.0.key', "batch-completing-{$ownBatch->id}");
    }
}
