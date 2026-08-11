<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_create_student_with_generated_code(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'receptionist']);

        $this->actingAs($user)->postJson('/api/students', [
            'first_name' => 'Ali',
            'last_name' => 'Khan',
            'phone' => '0300 1111111',
            'joining_date' => '2026-08-11',
            'status' => 'active',
        ])->assertCreated()->assertJsonPath('data.student_code', 'STD-00001');
    }

    public function test_teacher_can_view_but_not_create_students(): void
    {
        $institute = Institute::factory()->create();
        $teacher = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);
        Student::factory()->create(['institute_id' => $institute->id]);

        $this->actingAs($teacher)->getJson('/api/students')->assertOk();
        $this->actingAs($teacher)->postJson('/api/students', [
            'first_name' => 'Noor',
            'phone' => '0300 2222222',
            'joining_date' => '2026-08-11',
            'status' => 'active',
        ])->assertForbidden();
    }

    public function test_admin_cannot_view_other_institute_student(): void
    {
        $admin = User::factory()->create(['institute_id' => Institute::factory()->create()->id, 'role' => 'admin']);
        $student = Student::factory()->create(['institute_id' => Institute::factory()->create()->id]);

        $this->actingAs($admin)->getJson("/api/students/{$student->id}")->assertForbidden();
    }
}
