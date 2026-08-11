<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_view_and_create_courses(): void
    {
        $receptionist = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'receptionist',
        ]);

        $this->actingAs($receptionist)
            ->postJson('/api/courses', [
                'name' => 'Spoken English',
                'code' => 'SPOKEN',
                'description' => null,
                'duration_value' => 3,
                'duration_unit' => 'months',
                'standard_fee' => 12000,
                'admission_fee' => 0,
                'status' => 'active',
            ])
            ->assertCreated()
            ->assertJsonPath('data.institute_id', $receptionist->institute_id);

        $this->actingAs($receptionist)->getJson('/api/courses')->assertOk();
    }

    public function test_teacher_can_view_but_not_create_courses(): void
    {
        $teacher = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'teacher',
        ]);

        $this->actingAs($teacher)->getJson('/api/courses')->assertOk();

        $this->actingAs($teacher)
            ->postJson('/api/courses', [
                'name' => 'IELTS Preparation',
                'standard_fee' => 25000,
                'status' => 'active',
            ])
            ->assertForbidden();
    }

    public function test_admin_cannot_view_course_from_another_institute(): void
    {
        $admin = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'admin',
        ]);
        $otherCourse = Course::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
        ]);

        $this->actingAs($admin)
            ->getJson("/api/courses/{$otherCourse->id}")
            ->assertForbidden();
    }
}
