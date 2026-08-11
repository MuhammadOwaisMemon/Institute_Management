<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Enrollment::class);
        $items = Enrollment::with(['student', 'course', 'batch'])->where('institute_id', $request->user()->institute_id)->latest()->paginate(10);
        return $this->success(EnrollmentResource::collection($items)->resolve(), 'Enrollments retrieved.', meta: ['current_page' => $items->currentPage(), 'per_page' => $items->perPage(), 'total' => $items->total(), 'last_page' => $items->lastPage()]);
    }

    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $enrollment = DB::transaction(function () use ($request) {
            $instituteId = $request->user()->institute_id;
            $student = $request->filled('student_id') ? Student::findOrFail($request->validated('student_id')) : Student::create([
                ...$request->validated('student'),
                'institute_id' => $instituteId,
                'student_code' => $this->nextStudentCode($instituteId),
            ]);
            $course = Course::where('institute_id', $instituteId)->findOrFail($request->validated('course_id'));
            $batch = Batch::where('institute_id', $instituteId)->findOrFail($request->validated('batch_id'));
            if ((int) $batch->course_id !== (int) $course->id) {
                throw ValidationException::withMessages(['batch_id' => ['Selected batch does not belong to selected course.']]);
            }
            $duplicate = Enrollment::where('student_id', $student->id)->where('batch_id', $batch->id)->where('status', 'active')->exists();
            if ($duplicate) {
                throw ValidationException::withMessages(['batch_id' => ['Student already has an active enrollment in this batch.']]);
            }
            $agreed = (float) $request->validated('agreed_course_fee');
            $admission = (float) ($request->validated('admission_fee') ?? 0);
            $discountType = $request->validated('discount_type');
            $discountValue = (float) ($request->validated('discount_value') ?? 0);
            $discount = $discountType === 'percentage' ? (($agreed + $admission) * $discountValue / 100) : $discountValue;
            $final = max(0, ($agreed + $admission) - $discount);
            return Enrollment::create([...$request->safe()->except('student', 'student_id'), 'student_id' => $student->id, 'institute_id' => $instituteId, 'admission_fee' => $admission, 'discount_value' => $discountValue, 'final_course_fee' => $final]);
        });
        return $this->success(new EnrollmentResource($enrollment->load(['student', 'course', 'batch'])), 'Enrollment confirmed.', 201);
    }

    public function show(Request $request, Enrollment $enrollment): JsonResponse
    {
        Gate::authorize('view', $enrollment);

        return $this->success(new EnrollmentResource($enrollment->load(['student', 'course', 'batch'])), 'Enrollment retrieved.');
    }

    private function nextStudentCode(int $instituteId): string
    {
        $last = Student::where('institute_id', $instituteId)->latest('id')->value('student_code');
        return 'STD-'.str_pad((string) ($last ? ((int) str_replace('STD-', '', $last)) + 1 : 1), 5, '0', STR_PAD_LEFT);
    }
}
