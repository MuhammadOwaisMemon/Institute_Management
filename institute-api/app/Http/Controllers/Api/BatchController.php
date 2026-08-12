<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Batch\StoreBatchRequest;
use App\Http\Requests\Batch\UpdateBatchRequest;
use App\Http\Resources\BatchResource;
use App\Models\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BatchController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Batch::class);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');
        $courseId = $request->query('course_id');
        $teacherId = $request->query('teacher_id');
        $user = $request->user();

        $batches = Batch::query()
            ->with(['course', 'teacher'])
            ->where('institute_id', $user->institute_id)
            ->when($user->role === 'teacher', fn ($query) => $query->whereHas('teacher', fn ($query) => $query->where('user_id', $user->id)))
            ->when(in_array($status, ['upcoming', 'active', 'completed', 'cancelled'], true), fn ($query) => $query->where('status', $status))
            ->when($courseId, fn ($query) => $query->where('course_id', $courseId))
            ->when($teacherId, fn ($query) => $query->where('teacher_id', $teacherId))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('batch_code', 'like', "%{$search}%")
                        ->orWhere('room', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($this->perPage($request));

        return $this->success(
            BatchResource::collection($batches)->resolve(),
            'Batches retrieved.',
            meta: [
                'current_page' => $batches->currentPage(),
                'per_page' => $batches->perPage(),
                'total' => $batches->total(),
                'last_page' => $batches->lastPage(),
            ],
        );
    }

    public function store(StoreBatchRequest $request): JsonResponse
    {
        $batch = Batch::query()->create([
            ...$request->validated(),
            'institute_id' => $request->user()->institute_id,
        ]);

        return $this->success(new BatchResource($batch->load(['course', 'teacher'])), 'Batch created.', 201);
    }

    public function show(Request $request, Batch $batch): JsonResponse
    {
        Gate::authorize('view', $batch);

        return $this->success(new BatchResource($batch->load(['course', 'teacher'])), 'Batch retrieved.');
    }

    public function update(UpdateBatchRequest $request, Batch $batch): JsonResponse
    {
        $batch->fill($request->validated());
        $batch->save();

        return $this->success(new BatchResource($batch->fresh()->load(['course', 'teacher'])), 'Batch updated.');
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }
}
