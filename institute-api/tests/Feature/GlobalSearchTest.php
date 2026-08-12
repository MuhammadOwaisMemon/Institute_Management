<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Institute;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GlobalSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_search_returns_grouped_institute_scoped_results(): void
    {
        $institute = Institute::factory()->create();
        $otherInstitute = Institute::factory()->create();
        $admin = User::factory()->create(['institute_id' => $institute->id, 'role' => 'admin']);
        $course = Course::factory()->create(['institute_id' => $institute->id, 'name' => 'Spoken English']);
        $batch = Batch::factory()->forInstitute($institute)->create(['course_id' => $course->id, 'name' => 'Spoken English Evening']);
        Student::factory()->create(['institute_id' => $institute->id, 'first_name' => 'Ali', 'last_name' => 'Ahmed', 'student_code' => 'STD-00034', 'phone' => '03001234567']);
        Student::factory()->create(['institute_id' => $otherInstitute->id, 'first_name' => 'Ali', 'last_name' => 'Other']);

        $this->actingAs($admin)
            ->getJson('/api/search?q=Ali')
            ->assertOk()
            ->assertJsonCount(1, 'data.students')
            ->assertJsonPath('data.students.0.subtitle', 'STD-00034 · 03001234567');

        $this->actingAs($admin)
            ->getJson('/api/search?q=Spoken')
            ->assertOk()
            ->assertJsonPath('data.courses.0.href', "/courses/{$course->id}")
            ->assertJsonPath('data.batches.0.href', "/batches/{$batch->id}");
    }

    public function test_teacher_search_only_includes_assigned_batches(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create(['institute_id' => $institute->id, 'role' => 'teacher']);
        $teacher = Teacher::factory()->create(['institute_id' => $institute->id, 'user_id' => $user->id]);
        $ownBatch = Batch::factory()->forInstitute($institute)->create(['teacher_id' => $teacher->id, 'name' => 'Evening Assigned']);
        Batch::factory()->forInstitute($institute)->create(['name' => 'Evening Unassigned']);

        $this->actingAs($user)
            ->getJson('/api/search?q=Evening')
            ->assertOk()
            ->assertJsonCount(1, 'data.batches')
            ->assertJsonPath('data.batches.0.href', "/batches/{$ownBatch->id}");
    }
}
