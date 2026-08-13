<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login_and_fetch_current_user(): void
    {
        $user = User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ])->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', 'admin@example.com')
            ->assertJsonStructure(['meta' => ['token']]);

        $this->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->withHeader('Authorization', 'Bearer '.$response->json('meta.token'))
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_logout_invalidates_authenticated_session(): void
    {
        User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'email' => 'logout@example.com',
            'password' => 'secret-password',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'logout@example.com',
            'password' => 'secret-password',
        ])->assertOk();

        $this->postJson('/api/auth/logout')->assertOk();

        $this->refreshApplication();

        $this->getJson('/api/auth/user')->assertUnauthorized();
    }

    public function test_protected_api_requires_authentication(): void
    {
        $this->getJson('/api/students')->assertUnauthorized();
        $this->postJson('/api/payments', [])->assertUnauthorized();
        $this->getJson('/api/reports/pending-fees')->assertUnauthorized();
    }

    public function test_invalid_credentials_do_not_login(): void
    {
        User::factory()->create([
            'institute_id' => Institute::factory()->create()->id,
            'email' => 'staff@example.com',
            'password' => 'correct-password',
            'role' => 'receptionist',
            'status' => 'active',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'staff@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();

        $this->getJson('/api/auth/user')->assertUnauthorized();
    }
}
