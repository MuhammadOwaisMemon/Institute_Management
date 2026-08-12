<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends ApiController
{
    public function __construct(private readonly ActivityLogger $activity)
    {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $search = (string) $request->query('search', '');
        $users = User::query()
            ->where('institute_id', $request->user()->institute_id)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($this->perPage($request));

        return $this->success(
            UserResource::collection($users)->resolve(),
            'Users retrieved.',
            meta: [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create([
            ...$request->safe()->except('password', 'password_confirmation'),
            'institute_id' => $request->user()->institute_id,
            'password' => $request->validated('password'),
        ]);

        $this->activity->log($request, 'user.created', $user, "User {$user->name} was created.", [
            'role' => $user->role,
            'status' => $user->status,
            'email' => $user->email,
        ]);

        return $this->success(new UserResource($user), 'User created.', 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->safe()->except('password', 'password_confirmation');
        $beforeStatus = $user->status;

        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }

        $user->fill($data);
        $user->save();
        $user = $user->fresh();
        $action = $beforeStatus !== $user->status
            ? ($user->status === 'active' ? 'user.activated' : 'user.deactivated')
            : 'user.updated';
        $this->activity->log($request, $action, $user, "User {$user->name} was updated.", [
            'role' => $user->role,
            'status_before' => $beforeStatus,
            'status_after' => $user->status,
            'email' => $user->email,
        ]);

        return $this->success(new UserResource($user), 'User updated.');
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }
}
