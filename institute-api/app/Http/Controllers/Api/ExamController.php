<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Exam\BulkSaveExamResultsRequest;
use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Resources\ExamResource;
use App\Http\Resources\ExamResultResource;
use App\Http\Resources\StudentResource;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExamController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Exam::with('batch.course')
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->user()->role === 'teacher', fn ($query) => $query->whereHas('batch.teacher', fn ($query) => $query->where('user_id', $request->user()->id)))
            ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value))
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->latest('exam_date');

        $items = $query->paginate(min(max((int) $request->query('per_page', 15), 1), 100));

        return $this->success(ExamResource::collection($items)->resolve(), 'Exams retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $batch = $this->authorizedBatch($request, (int) $request->validated('batch_id'));

        $exam = Exam::create([
            ...$request->validated(),
            'institute_id' => $request->user()->institute_id,
            'batch_id' => $batch->id,
        ]);

        return $this->success(new ExamResource($exam->load('batch.course')), 'Exam created.', 201);
    }

    public function show(Request $request, Exam $exam): JsonResponse
    {
        $this->authorizedExam($request, $exam);

        return $this->success(new ExamResource($exam->load(['batch.course', 'results.student'])), 'Exam retrieved.');
    }

    public function students(Request $request, Exam $exam): JsonResponse
    {
        $this->authorizedExam($request, $exam);

        $students = Enrollment::with('student')
            ->where('institute_id', $request->user()->institute_id)
            ->where('batch_id', $exam->batch_id)
            ->where('status', 'active')
            ->whereDate('enrollment_date', '<=', $exam->exam_date)
            ->orderBy('id')
            ->get()
            ->pluck('student');

        $results = ExamResult::where('exam_id', $exam->id)->get()->keyBy('student_id');

        return $this->success($students->map(fn ($student) => [
            'student' => new StudentResource($student),
            'result' => $results->get($student->id) ? new ExamResultResource($results->get($student->id)) : null,
        ])->values(), 'Exam students loaded.');
    }

    public function saveResults(BulkSaveExamResultsRequest $request, Exam $exam): JsonResponse
    {
        $this->authorizedExam($request, $exam);
        $studentIds = Enrollment::where('institute_id', $request->user()->institute_id)
            ->where('batch_id', $exam->batch_id)
            ->where('status', 'active')
            ->pluck('student_id')
            ->all();

        DB::transaction(function () use ($request, $exam, $studentIds) {
            foreach ($request->validated('records') as $record) {
                if (! in_array((int) $record['student_id'], $studentIds, true)) {
                    throw ValidationException::withMessages(['records' => ['Student does not belong to the exam batch.']]);
                }

                $obtained = (float) $record['obtained_marks'];
                if ($obtained > (float) $exam->total_marks) {
                    throw ValidationException::withMessages(['records' => ['Obtained marks cannot exceed total marks.']]);
                }

                ExamResult::updateOrCreate(
                    ['exam_id' => $exam->id, 'student_id' => $record['student_id']],
                    [
                        'institute_id' => $request->user()->institute_id,
                        'obtained_marks' => $obtained,
                        'percentage' => round(($obtained / (float) $exam->total_marks) * 100, 2),
                        'grade' => $record['grade'] ?? null,
                        'remarks' => $record['remarks'] ?? null,
                    ],
                );
            }
        });

        return $this->success(ExamResultResource::collection($exam->results()->with('student')->get())->resolve(), 'Results saved.');
    }

    public function studentHistory(Request $request, int $studentId): JsonResponse
    {
        Student::where('institute_id', $request->user()->institute_id)->findOrFail($studentId);
        $items = ExamResult::with(['exam.batch.course', 'student'])
            ->where('institute_id', $request->user()->institute_id)
            ->where('student_id', $studentId)
            ->latest('id')
            ->get();

        return $this->success(ExamResultResource::collection($items)->resolve(), 'Student result history retrieved.');
    }

    public function batchResults(Request $request, Batch $batch): JsonResponse
    {
        $this->authorizedBatch($request, $batch->id);
        $items = ExamResult::with(['student', 'exam.batch.course'])
            ->where('institute_id', $request->user()->institute_id)
            ->whereHas('exam', fn ($query) => $query->where('batch_id', $batch->id))
            ->latest('id')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return $this->success(ExamResultResource::collection($items)->resolve(), 'Batch results retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    private function authorizedExam(Request $request, Exam $exam): Exam
    {
        abort_unless($exam->institute_id === $request->user()->institute_id, 403);
        $this->authorizedBatch($request, $exam->batch_id);
        return $exam;
    }

    private function authorizedBatch(Request $request, int $batchId): Batch
    {
        $batch = Batch::with('teacher')->where('institute_id', $request->user()->institute_id)->findOrFail($batchId);
        abort_if($request->user()->role === 'teacher' && $batch->teacher?->user_id !== $request->user()->id, 403);
        return $batch;
    }
}
