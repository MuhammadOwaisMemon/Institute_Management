<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AttendanceResource;
use App\Http\Resources\EnrollmentResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\StudentResource;
use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends ApiController
{
    public function students(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $query = $this->studentQuery($request);
        $items = $query->latest('joining_date')->paginate($this->perPage($request));

        return $this->success(StudentResource::collection($items)->resolve(), 'Student report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function studentsCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);

        return $this->csv('student-report.csv', ['Code', 'Student', 'Phone', 'Joining Date', 'Status'], function () use ($request) {
            $this->studentQuery($request)->orderBy('student_code')->chunk(200, function ($students) {
                foreach ($students as $student) {
                    $this->csvRow([$student->student_code, $student->full_name, $student->phone, $student->joining_date?->toDateString(), $student->status]);
                }
            });
        });
    }

    public function admissions(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $query = $this->admissionQuery($request);
        $items = $query->latest('enrollment_date')->paginate($this->perPage($request));

        return $this->success(EnrollmentResource::collection($items)->resolve(), 'Admission report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
            'total_final_fee' => $this->money((clone $query)->sum('final_course_fee')),
        ]);
    }

    public function admissionsCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);

        return $this->csv('admission-report.csv', ['Date', 'Student', 'Course', 'Batch', 'Final Fee', 'Status'], function () use ($request) {
            $this->admissionQuery($request)->orderBy('enrollment_date')->chunk(200, function ($enrollments) {
                foreach ($enrollments as $enrollment) {
                    $this->csvRow([
                        $enrollment->enrollment_date?->toDateString(),
                        $enrollment->student?->full_name,
                        $enrollment->course?->name,
                        $enrollment->batch?->name,
                        $enrollment->final_course_fee,
                        $enrollment->status,
                    ]);
                }
            });
        });
    }

    public function batchStudents(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $batchId = (int) $request->query('batch_id');
        abort_if($batchId <= 0, 422, 'Batch is required.');
        $this->instituteBatch($request, $batchId);

        $query = Enrollment::query()
            ->with(['student', 'course', 'batch'])
            ->where('institute_id', $request->user()->institute_id)
            ->where('batch_id', $batchId)
            ->latest('enrollment_date');

        $items = $query->paginate($this->perPage($request));

        return $this->success(EnrollmentResource::collection($items)->resolve(), 'Batch students report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function batchStudentsCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);
        $batchId = (int) $request->query('batch_id');
        abort_if($batchId <= 0, 422, 'Batch is required.');
        $this->instituteBatch($request, $batchId);

        return $this->csv('batch-students-report.csv', ['Code', 'Student', 'Phone', 'Course', 'Batch', 'Admission Date', 'Status'], function () use ($request, $batchId) {
            Enrollment::with(['student', 'course', 'batch'])
                ->where('institute_id', $request->user()->institute_id)
                ->where('batch_id', $batchId)
                ->orderBy('enrollment_date')
                ->chunk(200, function ($enrollments) {
                    foreach ($enrollments as $enrollment) {
                        $this->csvRow([
                            $enrollment->student?->student_code,
                            $enrollment->student?->full_name,
                            $enrollment->student?->phone,
                            $enrollment->course?->name,
                            $enrollment->batch?->name,
                            $enrollment->enrollment_date?->toDateString(),
                            $enrollment->status,
                        ]);
                    }
                });
        });
    }

    public function feeCollection(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $query = $this->paymentQuery($request);
        $items = $query->latest('payment_date')->latest('id')->paginate($this->perPage($request));

        return $this->success(PaymentResource::collection($items)->resolve(), 'Fee collection report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
            'total_amount' => $this->money((clone $query)->sum('amount')),
        ]);
    }

    public function feeCollectionCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);

        return $this->csv('fee-collection-report.csv', ['Receipt', 'Student', 'Course', 'Batch', 'Date', 'Amount', 'Method', 'Received By'], function () use ($request) {
            $this->paymentQuery($request)->orderBy('payment_date')->chunk(200, function ($payments) {
                foreach ($payments as $payment) {
                    $this->csvRow([
                        $payment->receipt_number,
                        $payment->student?->full_name,
                        $payment->enrollment?->course?->name,
                        $payment->enrollment?->batch?->name,
                        $payment->payment_date?->toDateString(),
                        $payment->amount,
                        $payment->payment_method,
                        $payment->receiver?->name,
                    ]);
                }
            });
        });
    }

    public function pendingFees(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $query = $this->pendingFeeQuery($request);
        $items = $query->orderBy('next_due_date')->paginate($this->perPage($request));

        return $this->success($items->getCollection()->map(fn (Enrollment $enrollment) => $this->pendingFeeRow($enrollment))->values(), 'Pending fee report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
            'total_remaining' => $this->money($this->pendingRemainingTotal($request)),
        ]);
    }

    public function pendingFeesCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);

        return $this->csv('pending-fee-report.csv', ['Student', 'Course', 'Total Fee', 'Paid', 'Remaining', 'Next Due Date'], function () use ($request) {
            $this->pendingFeeQuery($request)->orderBy('next_due_date')->chunk(200, function ($enrollments) {
                foreach ($enrollments as $enrollment) {
                    $row = $this->pendingFeeRow($enrollment);
                    $this->csvRow([$row['student'], $row['course'], $row['total_fee'], $row['paid'], $row['remaining'], $row['next_due_date']]);
                }
            });
        });
    }

    public function attendance(Request $request): JsonResponse
    {
        $this->authorizeReports($request);

        $query = $this->attendanceQuery($request);
        $items = $query->latest('attendance_date')->latest('id')->paginate($this->perPage($request));

        return $this->success(AttendanceResource::collection($items)->resolve(), 'Attendance report retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
            'present' => (clone $query)->where('status', 'present')->count(),
            'absent' => (clone $query)->where('status', 'absent')->count(),
            'leave' => (clone $query)->where('status', 'leave')->count(),
        ]);
    }

    public function attendanceCsv(Request $request): StreamedResponse
    {
        $this->authorizeReports($request);

        return $this->csv('attendance-report.csv', ['Date', 'Student', 'Batch', 'Course', 'Status', 'Remarks'], function () use ($request) {
            $this->attendanceQuery($request)->orderBy('attendance_date')->chunk(200, function ($records) {
                foreach ($records as $record) {
                    $this->csvRow([
                        $record->attendance_date?->toDateString(),
                        $record->student?->full_name,
                        $record->batch?->name,
                        $record->batch?->course?->name,
                        $record->status,
                        $record->remarks,
                    ]);
                }
            });
        });
    }

    private function studentQuery(Request $request): Builder
    {
        return Student::query()
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->when($request->query('joining_from'), fn ($query, $value) => $query->whereDate('joining_date', '>=', $value))
            ->when($request->query('joining_to'), fn ($query, $value) => $query->whereDate('joining_date', '<=', $value))
            ->when($request->query('course_id') || $request->query('batch_id'), fn ($query) => $query->whereHas('enrollments', function ($query) use ($request) {
                $query->where('institute_id', $request->user()->institute_id)
                    ->when($request->query('course_id'), fn ($query, $value) => $query->where('course_id', $value))
                    ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value));
            }));
    }

    private function admissionQuery(Request $request): Builder
    {
        return Enrollment::query()
            ->with(['student', 'course', 'batch'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('date_from'), fn ($query, $value) => $query->whereDate('enrollment_date', '>=', $value))
            ->when($request->query('date_to'), fn ($query, $value) => $query->whereDate('enrollment_date', '<=', $value))
            ->when($request->query('course_id'), fn ($query, $value) => $query->where('course_id', $value))
            ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value));
    }

    private function paymentQuery(Request $request): Builder
    {
        return Payment::query()
            ->with(['student', 'enrollment.course', 'enrollment.batch', 'receiver'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('date_from'), fn ($query, $value) => $query->whereDate('payment_date', '>=', $value))
            ->when($request->query('date_to'), fn ($query, $value) => $query->whereDate('payment_date', '<=', $value))
            ->when($request->query('payment_method'), fn ($query, $value) => $query->where('payment_method', $value))
            ->when($request->query('course_id'), fn ($query, $value) => $query->whereHas('enrollment', fn ($query) => $query->where('institute_id', $request->user()->institute_id)->where('course_id', $value)))
            ->when($request->query('batch_id'), fn ($query, $value) => $query->whereHas('enrollment', fn ($query) => $query->where('institute_id', $request->user()->institute_id)->where('batch_id', $value)));
    }

    private function pendingFeeQuery(Request $request): Builder
    {
        $paidSubquery = Payment::query()
            ->selectRaw('coalesce(sum(amount), 0)')
            ->where('institute_id', $request->user()->institute_id)
            ->whereColumn('payments.enrollment_id', 'enrollments.id');

        $nextDueSubquery = FeeInstallment::query()
            ->selectRaw('min(due_date)')
            ->where('institute_id', $request->user()->institute_id)
            ->whereColumn('fee_installments.enrollment_id', 'enrollments.id')
            ->whereIn('status', ['pending', 'partially_paid', 'overdue']);

        return Enrollment::query()
            ->with(['student', 'course', 'batch'])
            ->select('enrollments.*')
            ->selectSub($paidSubquery, 'paid_total')
            ->selectSub($nextDueSubquery, 'next_due_date')
            ->where('institute_id', $request->user()->institute_id)
            ->where('status', 'active')
            ->whereRaw('final_course_fee > (select coalesce(sum(amount), 0) from payments where payments.institute_id = ? and payments.enrollment_id = enrollments.id)', [$request->user()->institute_id])
            ->when($request->query('course_id'), fn ($query, $value) => $query->where('course_id', $value))
            ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value));
    }

    private function attendanceQuery(Request $request): Builder
    {
        return Attendance::query()
            ->with(['student', 'batch.course'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value))
            ->when($request->query('student_id'), fn ($query, $value) => $query->where('student_id', $value))
            ->when($request->query('month'), fn ($query, $value) => $query->where('attendance_date', 'like', "{$value}%"))
            ->when($request->query('date_from'), fn ($query, $value) => $query->whereDate('attendance_date', '>=', $value))
            ->when($request->query('date_to'), fn ($query, $value) => $query->whereDate('attendance_date', '<=', $value));
    }

    private function pendingFeeRow(Enrollment $enrollment): array
    {
        $paid = (float) ($enrollment->paid_total ?? 0);

        return [
            'id' => $enrollment->id,
            'student' => $enrollment->student?->full_name,
            'course' => $enrollment->course?->name,
            'batch' => $enrollment->batch?->name,
            'total_fee' => $this->money($enrollment->final_course_fee),
            'paid' => $this->money($paid),
            'remaining' => $this->money($this->remaining($enrollment)),
            'next_due_date' => $enrollment->next_due_date,
        ];
    }

    private function pendingRemainingTotal(Request $request): float
    {
        $paidSql = '(select coalesce(sum(amount), 0) from payments where payments.institute_id = ? and payments.enrollment_id = enrollments.id)';

        return (float) Enrollment::query()
            ->where('institute_id', $request->user()->institute_id)
            ->where('status', 'active')
            ->whereRaw("final_course_fee > {$paidSql}", [$request->user()->institute_id])
            ->when($request->query('course_id'), fn ($query, $value) => $query->where('course_id', $value))
            ->when($request->query('batch_id'), fn ($query, $value) => $query->where('batch_id', $value))
            ->selectRaw("coalesce(sum(final_course_fee - {$paidSql}), 0) as remaining", [$request->user()->institute_id])
            ->value('remaining');
    }

    private function remaining(Enrollment $enrollment): float
    {
        return max(0, (float) $enrollment->final_course_fee - (float) ($enrollment->paid_total ?? 0));
    }

    private function instituteBatch(Request $request, int $batchId): Batch
    {
        return Batch::where('institute_id', $request->user()->institute_id)->findOrFail($batchId);
    }

    private function authorizeReports(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['admin', 'receptionist'], true), 403);
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 15), 1), 100);
    }

    private function csv(string $filename, array $headers, callable $writeRows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $writeRows) {
            $this->csvRow($headers);
            $writeRows();
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function csvRow(array $row): void
    {
        $handle = fopen('php://output', 'ab');
        fputcsv($handle, $row);
        fclose($handle);
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
