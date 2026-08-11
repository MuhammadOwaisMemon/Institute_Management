<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FeeInstallment\StoreFeeInstallmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Http\Resources\FeeInstallmentResource;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FeeInstallmentController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->refreshOverdue($request->user()->institute_id);
        $items = FeeInstallment::query()
            ->with(['enrollment.student', 'enrollment.course', 'enrollment.batch'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('due_date'), fn ($q, $v) => $q->whereDate('due_date', $v))
            ->when($request->query('student_id'), fn ($q, $v) => $q->whereHas('enrollment', fn ($q) => $q->where('student_id', $v)))
            ->when($request->query('course_id'), fn ($q, $v) => $q->whereHas('enrollment', fn ($q) => $q->where('course_id', $v)))
            ->when($request->query('batch_id'), fn ($q, $v) => $q->whereHas('enrollment', fn ($q) => $q->where('batch_id', $v)))
            ->orderBy('due_date')
            ->paginate(15);

        return $this->success(FeeInstallmentResource::collection($items)->resolve(), 'Fee installments retrieved.', meta: [
            'current_page' => $items->currentPage(), 'per_page' => $items->perPage(), 'total' => $items->total(), 'last_page' => $items->lastPage(),
        ]);
    }

    public function store(StoreFeeInstallmentRequest $request): JsonResponse
    {
        $installment = DB::transaction(function () use ($request) {
            $enrollment = Enrollment::where('institute_id', $request->user()->institute_id)->lockForUpdate()->findOrFail($request->validated('enrollment_id'));
            $scheduled = (float) FeeInstallment::where('enrollment_id', $enrollment->id)->sum('amount');
            $amount = (float) $request->validated('amount');
            if ($scheduled + $amount > (float) $enrollment->final_course_fee) {
                throw ValidationException::withMessages(['amount' => ['Installment total cannot exceed final payable amount.']]);
            }
            return FeeInstallment::create([...$request->validated(), 'institute_id' => $request->user()->institute_id, 'status' => now()->toDateString() > $request->validated('due_date') ? 'overdue' : 'pending']);
        });
        return $this->success(new FeeInstallmentResource($installment->load('enrollment')), 'Installment created.', 201);
    }

    public function summary(Request $request, Enrollment $enrollment): JsonResponse
    {
        abort_unless($enrollment->institute_id === $request->user()->institute_id, 403);
        $this->refreshOverdue($request->user()->institute_id);
        $items = $enrollment->installments()->orderBy('due_date')->get();
        $paid = (float) $items->sum('paid_amount');
        return $this->success([
            'enrollment' => new EnrollmentResource($enrollment->load(['student', 'course', 'batch'])),
            'total_fee' => $enrollment->final_course_fee,
            'total_paid' => number_format($paid, 2, '.', ''),
            'remaining_balance' => number_format(max(0, (float) $enrollment->final_course_fee - $paid), 2, '.', ''),
            'installments' => FeeInstallmentResource::collection($items)->resolve(),
        ], 'Fee summary retrieved.');
    }

    private function refreshOverdue(int $instituteId): void
    {
        FeeInstallment::where('institute_id', $instituteId)->whereIn('status', ['pending', 'partially_paid'])->whereDate('due_date', '<', now()->toDateString())->update(['status' => 'overdue']);
    }
}
