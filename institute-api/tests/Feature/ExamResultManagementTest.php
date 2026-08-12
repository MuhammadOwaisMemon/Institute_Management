<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Institute;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamResultManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_exam_results_are_bulk_saved_with_percentage(): void
    {
        [$admin, $batch, $student] = $this->setupBatchEnrollment();

        $exam = Exam::create([
            'institute_id' => $admin->institute_id,
            'batch_id' => $batch->id,
            'title' => 'Mid Term',
            'exam_date' => '2026-08-12',
            'total_marks' => 100,
            'passing_marks' => 40,
            'status' => 'scheduled',
        ]);

        $this->actingAs($admin)
            ->postJson("/api/exams/{$exam->id}/results", [
                'records' => [
                    ['student_id' => $student->id, 'obtained_marks' => 75, 'grade' => 'A', 'remarks' => 'Good'],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.0.percentage', '75.00')
            ->assertJsonPath('data.0.grade', 'A');

        $this->assertDatabaseHas('exam_results', [
            'exam_id' => $exam->id,
            'student_id' => $student->id,
            'obtained_marks' => 75,
            'percentage' => 75,
        ]);
    }

    public function test_obtained_marks_cannot_exceed_total_marks(): void
    {
        [$admin, $batch, $student] = $this->setupBatchEnrollment();
        $exam = Exam::create([
            'institute_id' => $admin->institute_id,
            'batch_id' => $batch->id,
            'title' => 'Quiz',
            'exam_date' => '2026-08-12',
            'total_marks' => 20,
            'status' => 'scheduled',
        ]);

        $this->actingAs($admin)
            ->postJson("/api/exams/{$exam->id}/results", [
                'records' => [
                    ['student_id' => $student->id, 'obtained_marks' => 21],
                ],
            ])
            ->assertUnprocessable();
    }

    public function test_teacher_cannot_create_exam_for_unassigned_batch(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);
        Teacher::factory()->create(['institute_id' => $institute->id, 'user_id' => $user->id]);
        $batch = Batch::factory()->forInstitute($institute)->create();

        $this->actingAs($user)
            ->postJson('/api/exams', [
                'batch_id' => $batch->id,
                'title' => 'Class Test',
                'exam_date' => '2026-08-12',
                'total_marks' => 50,
                'status' => 'scheduled',
            ])
            ->assertForbidden();
    }

    private function setupBatchEnrollment(): array
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => $institute->id]);
        $course = Course::factory()->create(['institute_id' => $institute->id]);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id]);

        Enrollment::create([
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

        return [$admin, $batch, $student];
    }
}
