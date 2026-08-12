<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Requests\Student\UploadStudentPhotoRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class StudentController extends ApiController
{
    public function __construct(private readonly ActivityLogger $activity)
    {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Student::class);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');
        $students = Student::query()
            ->where('institute_id', $request->user()->institute_id)
            ->when(in_array($status, ['active', 'completed', 'dropped', 'inactive'], true), fn ($q) => $q->where('status', $status))
            ->when($search !== '', fn ($q) => $q->where(fn ($q) => $q
                ->where('student_code', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->latest()
            ->paginate($this->perPage($request));

        return $this->success(StudentResource::collection($students)->resolve(), 'Students retrieved.', meta: [
            'current_page' => $students->currentPage(),
            'per_page' => $students->perPage(),
            'total' => $students->total(),
            'last_page' => $students->lastPage(),
        ]);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = Student::query()->create([
            ...$request->validated(),
            'institute_id' => $request->user()->institute_id,
            'student_code' => $this->nextCode($request->user()->institute_id),
        ]);

        $this->activity->log($request, 'student.created', $student, "Student {$student->full_name} was created.", [
            'student_code' => $student->student_code,
            'status' => $student->status,
        ]);

        return $this->success(new StudentResource($student), 'Student created.', 201);
    }

    public function show(Request $request, Student $student): JsonResponse
    {
        Gate::authorize('view', $student);
        return $this->success(new StudentResource($student), 'Student retrieved.');
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $before = $student->only(['first_name', 'last_name', 'phone', 'status', 'city']);
        $student->fill($request->validated())->save();
        $student = $student->fresh();
        $this->activity->log($request, 'student.updated', $student, "Student {$student->full_name} was updated.", [
            'before' => $before,
            'after' => $student->only(['first_name', 'last_name', 'phone', 'status', 'city']),
        ]);

        return $this->success(new StudentResource($student), 'Student updated.');
    }

    public function photo(UploadStudentPhotoRequest $request, Student $student): JsonResponse
    {
        if ($student->photo) {
            Storage::disk('public')->delete($student->photo);
        }
        $student->photo = $request->file('photo')->store('student-photos', 'public');
        $student->save();

        return $this->success(new StudentResource($student->fresh()), 'Student photo updated.');
    }

    private function nextCode(int $instituteId): string
    {
        $last = Student::query()->where('institute_id', $instituteId)->latest('id')->value('student_code');
        $number = $last ? ((int) str_replace('STD-', '', $last)) + 1 : 1;

        return 'STD-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }
}
