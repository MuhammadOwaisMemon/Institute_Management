<?php

namespace App\Http\Controllers\Api;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SearchController extends ApiController
{
    public function __invoke(Request $request): JsonResponse
    {
        $term = mb_substr(trim((string) $request->query('q', '')), 0, 50);

        if (mb_strlen($term) < 2) {
            return $this->success([
                'students' => [],
                'courses' => [],
                'batches' => [],
            ], 'Search results retrieved.');
        }

        return $this->success([
            'students' => Gate::allows('viewAny', Student::class) ? $this->students($request, $term) : [],
            'courses' => Gate::allows('viewAny', Course::class) ? $this->courses($request, $term) : [],
            'batches' => Gate::allows('viewAny', Batch::class) ? $this->batches($request, $term) : [],
        ], 'Search results retrieved.');
    }

    private function students(Request $request, string $term): array
    {
        $like = $this->like($term);
        $prefix = $this->like($term, false);

        return Student::query()
            ->where('institute_id', $request->user()->institute_id)
            ->where(function ($query) use ($like, $prefix): void {
                $query->where('student_code', 'like', $prefix)
                    ->orWhere('phone', 'like', $prefix)
                    ->orWhere('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like);
            })
            ->orderBy('first_name')
            ->limit(5)
            ->get(['id', 'student_code', 'first_name', 'last_name', 'phone'])
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'title' => $student->full_name,
                'subtitle' => trim($student->student_code.' · '.$student->phone),
                'href' => "/students/{$student->id}",
            ])
            ->all();
    }

    private function courses(Request $request, string $term): array
    {
        $like = $this->like($term);
        $prefix = $this->like($term, false);

        return Course::query()
            ->where('institute_id', $request->user()->institute_id)
            ->where(function ($query) use ($like, $prefix): void {
                $query->where('name', 'like', $like)
                    ->orWhere('code', 'like', $prefix);
            })
            ->orderBy('name')
            ->limit(5)
            ->get(['id', 'name', 'code'])
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->name,
                'subtitle' => $course->code ?? 'Course',
                'href' => "/courses/{$course->id}",
            ])
            ->all();
    }

    private function batches(Request $request, string $term): array
    {
        $user = $request->user();
        $like = $this->like($term);
        $prefix = $this->like($term, false);

        return Batch::query()
            ->with('course:id,name')
            ->where('institute_id', $user->institute_id)
            ->when($user->role === 'teacher', fn ($query) => $query->whereHas('teacher', fn ($query) => $query->where('user_id', $user->id)))
            ->where(function ($query) use ($like, $prefix): void {
                $query->where('name', 'like', $like)
                    ->orWhere('batch_code', 'like', $prefix);
            })
            ->orderBy('name')
            ->limit(5)
            ->get(['id', 'course_id', 'name', 'batch_code'])
            ->map(fn (Batch $batch) => [
                'id' => $batch->id,
                'title' => $batch->name,
                'subtitle' => $batch->course?->name ?? $batch->batch_code ?? 'Batch',
                'href' => "/batches/{$batch->id}",
            ])
            ->all();
    }

    private function like(string $term, bool $contains = true): string
    {
        $escaped = addcslashes($term, "\\%_");

        return $contains ? "%{$escaped}%" : "{$escaped}%";
    }
}
