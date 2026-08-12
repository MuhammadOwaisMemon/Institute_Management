<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Course::class);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');

        $courses = Course::query()
            ->where('institute_id', $request->user()->institute_id)
            ->when(in_array($status, ['active', 'inactive'], true), fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($this->perPage($request));

        return $this->success(
            CourseResource::collection($courses)->resolve(),
            'Courses retrieved.',
            meta: [
                'current_page' => $courses->currentPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'last_page' => $courses->lastPage(),
            ],
        );
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::query()->create([
            ...$request->validated(),
            'institute_id' => $request->user()->institute_id,
            'admission_fee' => $request->validated('admission_fee') ?? 0,
        ]);

        return $this->success(new CourseResource($course), 'Course created.', 201);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        Gate::authorize('view', $course);

        return $this->success(new CourseResource($course), 'Course retrieved.');
    }

    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $course->fill([
            ...$request->validated(),
            'admission_fee' => $request->validated('admission_fee') ?? 0,
        ]);
        $course->save();

        return $this->success(new CourseResource($course->fresh()), 'Course updated.');
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }
}
