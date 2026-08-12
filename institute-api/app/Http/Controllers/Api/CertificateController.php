<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Certificate\StoreCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Institute;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CertificateController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeCertificates($request);

        $items = Certificate::query()
            ->with(['student', 'course', 'enrollment.batch'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('student_id'), fn ($query, $value) => $query->where('student_id', $value))
            ->when($request->query('course_id'), fn ($query, $value) => $query->where('course_id', $value))
            ->when($request->query('search'), fn ($query, $value) => $query->where(fn ($query) => $query
                ->where('certificate_number', 'like', "%{$value}%")
                ->orWhereHas('student', fn ($query) => $query->where('first_name', 'like', "%{$value}%")->orWhere('student_code', 'like', "%{$value}%"))))
            ->latest('issue_date')
            ->paginate(min(max((int) $request->query('per_page', 15), 1), 100));

        return $this->success(CertificateResource::collection($items)->resolve(), 'Certificates retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function store(StoreCertificateRequest $request): JsonResponse
    {
        $certificate = DB::transaction(function () use ($request) {
            Institute::whereKey($request->user()->institute_id)->lockForUpdate()->firstOrFail();
            $enrollment = Enrollment::with(['student', 'course', 'batch'])
                ->where('institute_id', $request->user()->institute_id)
                ->lockForUpdate()
                ->findOrFail($request->validated('enrollment_id'));

            if ($enrollment->status !== 'completed') {
                throw ValidationException::withMessages(['enrollment_id' => ['Certificate can only be generated for a completed enrollment.']]);
            }

            if ($request->validated('completion_date') < $enrollment->enrollment_date?->toDateString()) {
                throw ValidationException::withMessages(['completion_date' => ['Completion date cannot be before enrollment date.']]);
            }

            if (Certificate::where('institute_id', $request->user()->institute_id)->where('enrollment_id', $enrollment->id)->exists()) {
                throw ValidationException::withMessages(['enrollment_id' => ['Certificate already exists for this enrollment.']]);
            }

            return Certificate::create([
                'institute_id' => $request->user()->institute_id,
                'enrollment_id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'course_id' => $enrollment->course_id,
                'certificate_number' => $this->nextNumber($request->user()->institute_id, $request->validated('issue_date')),
                'issue_date' => $request->validated('issue_date'),
                'completion_date' => $request->validated('completion_date'),
                'remarks' => $request->validated('remarks'),
            ]);
        });

        return $this->success(new CertificateResource($certificate->load(['student', 'course', 'enrollment.batch'])), 'Certificate generated.', 201);
    }

    public function show(Request $request, Certificate $certificate): JsonResponse
    {
        $this->authorizeCertificates($request);
        abort_unless($certificate->institute_id === $request->user()->institute_id, 403);

        return $this->success([
            'certificate' => new CertificateResource($certificate->load(['student', 'course', 'enrollment.batch'])),
            'institute' => new \App\Http\Resources\InstituteResource(Institute::findOrFail($certificate->institute_id)),
        ], 'Certificate retrieved.');
    }

    public function studentHistory(Request $request, int $studentId): JsonResponse
    {
        $this->authorizeCertificates($request);
        Student::where('institute_id', $request->user()->institute_id)->findOrFail($studentId);

        $items = Certificate::with(['course', 'enrollment.batch'])
            ->where('institute_id', $request->user()->institute_id)
            ->where('student_id', $studentId)
            ->latest('issue_date')
            ->get();

        return $this->success(CertificateResource::collection($items)->resolve(), 'Student certificate history retrieved.');
    }

    private function nextNumber(int $instituteId, string $issueDate): string
    {
        $year = date('Y', strtotime($issueDate));
        $prefix = "CERT-{$year}-";
        $last = Certificate::where('institute_id', $instituteId)
            ->where('certificate_number', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->latest('id')
            ->value('certificate_number');
        $next = $last ? ((int) str_replace($prefix, '', $last)) + 1 : 1;

        return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    private function authorizeCertificates(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['admin', 'receptionist'], true), 403);
    }
}
