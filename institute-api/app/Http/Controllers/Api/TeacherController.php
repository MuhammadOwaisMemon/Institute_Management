<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Teacher\StoreTeacherRequest;
use App\Http\Requests\Teacher\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TeacherController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Teacher::class);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');
        $user = $request->user();

        $teachers = Teacher::query()
            ->with('user')
            ->where('institute_id', $user->institute_id)
            ->when($user->role === 'teacher', fn ($query) => $query->where('user_id', $user->id))
            ->when(in_array($status, ['active', 'inactive'], true), fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($this->perPage($request));

        return $this->success(
            TeacherResource::collection($teachers)->resolve(),
            'Teachers retrieved.',
            meta: [
                'current_page' => $teachers->currentPage(),
                'per_page' => $teachers->perPage(),
                'total' => $teachers->total(),
                'last_page' => $teachers->lastPage(),
            ],
        );
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $teacher = Teacher::query()->create([
            ...$request->validated(),
            'institute_id' => $request->user()->institute_id,
        ]);

        return $this->success(new TeacherResource($teacher->load('user')), 'Teacher created.', 201);
    }

    public function show(Request $request, Teacher $teacher): JsonResponse
    {
        Gate::authorize('view', $teacher);

        return $this->success(new TeacherResource($teacher->load('user')), 'Teacher retrieved.');
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): JsonResponse
    {
        $teacher->fill($request->validated());
        $teacher->save();

        return $this->success(new TeacherResource($teacher->fresh()->load('user')), 'Teacher updated.');
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }
}
