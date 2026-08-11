<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_teacher_for_own_institute(): void
    {
        $admin = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/teachers', [
                'employee_code' => 'T-001',
                'first_name' => 'Ayesha',
                'last_name' => 'Khan',
                'gender' => 'female',
                'phone' => '0300 1234567',
                'email' => 'ayesha@example.com',
                'cnic' => null,
                'address' => null,
                'joining_date' => '2026-08-11',
                'status' => 'active',
                'notes' => null,
            ])
            ->assertCreated()
            ->assertJsonPath('data.institute_id', $admin->institute_id);
    }

    public function test_teacher_can_only_view_own_teacher_profile(): void
    {
        $institute = Institute::factory()->create();
        $user = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'teacher',
        ]);
        $ownTeacher = Teacher::factory()->create([
            'institute_id' => $institute->id,
            'user_id' => $user->id,
        ]);
        $otherTeacher = Teacher::factory()->create([
            'institute_id' => $institute->id,
        ]);

        $this->actingAs($user)->getJson("/api/teachers/{$ownTeacher->id}")->assertOk();
        $this->actingAs($user)->getJson("/api/teachers/{$otherTeacher->id}")->assertForbidden();
    }

    public function test_receptionist_can_update_teacher_status(): void
    {
        $institute = Institute::factory()->create();
        $receptionist = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'receptionist',
        ]);
        $teacher = Teacher::factory()->create([
            'institute_id' => $institute->id,
            'status' => 'active',
        ]);

        $this->actingAs($receptionist)
            ->putJson("/api/teachers/{$teacher->id}", [
                'user_id' => null,
                'employee_code' => $teacher->employee_code,
                'first_name' => $teacher->first_name,
                'last_name' => $teacher->last_name,
                'gender' => $teacher->gender,
                'phone' => $teacher->phone,
                'email' => $teacher->email,
                'cnic' => $teacher->cnic,
                'address' => $teacher->address,
                'joining_date' => $teacher->joining_date->toDateString(),
                'status' => 'inactive',
                'notes' => null,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }
}
