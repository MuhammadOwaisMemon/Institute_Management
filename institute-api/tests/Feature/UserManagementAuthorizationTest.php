<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users_in_own_institute(): void
    {
        $institute = Institute::factory()->create();
        $admin = User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'teacher',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/settings/users')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_receptionist_cannot_manage_users(): void
    {
        $receptionist = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'receptionist',
            'status' => 'active',
        ]);

        $this->actingAs($receptionist)
            ->getJson('/api/settings/users')
            ->assertForbidden();
    }

    public function test_admin_cannot_update_user_from_another_institute(): void
    {
        $admin = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $otherUser = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'role' => 'teacher',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->putJson("/api/settings/users/{$otherUser->id}", [
                'name' => 'Updated Teacher',
                'email' => $otherUser->email,
                'phone' => null,
                'role' => 'teacher',
                'status' => 'active',
            ])
            ->assertForbidden();
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'email' => 'inactive@example.com',
            'password' => 'password',
            'role' => 'teacher',
            'status' => 'inactive',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'inactive@example.com',
            'password' => 'password',
        ])->assertUnprocessable();
    }
}
