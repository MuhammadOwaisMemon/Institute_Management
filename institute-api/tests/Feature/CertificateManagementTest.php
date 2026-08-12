<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Institute;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_certificate_is_generated_for_valid_enrollment(): void
    {
        [$admin, $enrollment] = $this->setupEnrollment();

        $this->actingAs($admin)
            ->postJson('/api/certificates', [
                'enrollment_id' => $enrollment->id,
                'issue_date' => '2026-08-12',
                'completion_date' => '2026-08-10',
                'remarks' => 'Completed successfully.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.certificate_number', 'CERT-2026-00001')
            ->assertJsonPath('data.student_id', $enrollment->student_id)
            ->assertJsonPath('data.course_id', $enrollment->course_id);

        $this->assertDatabaseHas('certificates', [
            'enrollment_id' => $enrollment->id,
            'certificate_number' => 'CERT-2026-00001',
        ]);
    }

    public function test_duplicate_certificate_for_enrollment_is_blocked(): void
    {
        [$admin, $enrollment] = $this->setupEnrollment();
        Certificate::create([
            'institute_id' => $admin->institute_id,
            'enrollment_id' => $enrollment->id,
            'student_id' => $enrollment->student_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-2026-00001',
            'issue_date' => '2026-08-12',
            'completion_date' => '2026-08-10',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/certificates', [
                'enrollment_id' => $enrollment->id,
                'issue_date' => '2026-08-13',
                'completion_date' => '2026-08-10',
            ])
            ->assertUnprocessable();
    }

    public function test_certificate_print_payload_includes_institute(): void
    {
        [$admin, $enrollment] = $this->setupEnrollment();
        $certificate = Certificate::create([
            'institute_id' => $admin->institute_id,
            'enrollment_id' => $enrollment->id,
            'student_id' => $enrollment->student_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-2026-00001',
            'issue_date' => '2026-08-12',
            'completion_date' => '2026-08-10',
        ]);

        $this->actingAs($admin)
            ->getJson("/api/certificates/{$certificate->id}")
            ->assertOk()
            ->assertJsonPath('data.certificate.certificate_number', 'CERT-2026-00001')
            ->assertJsonPath('data.institute.id', $admin->institute_id);
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
            'status' => 'completed',
            'completion_date' => '2026-08-10',
        ]);

        return [$admin, $enrollment];
    }
}
