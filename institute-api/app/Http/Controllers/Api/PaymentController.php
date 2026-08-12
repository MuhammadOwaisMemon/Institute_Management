<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Institute;
use App\Models\Payment;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentController extends ApiController
{
    public function __construct(private readonly ActivityLogger $activity)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $items = Payment::with(['student','enrollment.course','enrollment.batch','installment','receiver'])
            ->where('institute_id', $request->user()->institute_id)
            ->when($request->query('search'), fn ($q, $s) => $q->where(fn ($q) => $q->where('receipt_number','like',"%{$s}%")->orWhereHas('student', fn ($q) => $q->where('student_code','like',"%{$s}%")->orWhere('first_name','like',"%{$s}%")->orWhere('phone','like',"%{$s}%"))))
            ->when($request->query('student_id'), fn ($q, $v) => $q->where('student_id', $v))
            ->when($request->query('enrollment_id'), fn ($q, $v) => $q->where('enrollment_id', $v))
            ->when($request->query('method'), fn ($q, $v) => $q->where('payment_method', $v))
            ->when($request->query('date'), fn ($q, $v) => $q->whereDate('payment_date', $v))
            ->latest()->paginate(15);
        return $this->success(PaymentResource::collection($items)->resolve(), 'Payments retrieved.', meta: ['current_page'=>$items->currentPage(),'per_page'=>$items->perPage(),'total'=>$items->total(),'last_page'=>$items->lastPage()]);
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = DB::transaction(function () use ($request) {
            $instituteId = $request->user()->institute_id;
            Institute::whereKey($instituteId)->lockForUpdate()->firstOrFail();
            $enrollment = Enrollment::where('institute_id', $instituteId)->lockForUpdate()->findOrFail($request->validated('enrollment_id'));
            $amount = (float) $request->validated('amount');
            $paid = (float) Payment::where('institute_id', $instituteId)->where('enrollment_id', $enrollment->id)->lockForUpdate()->sum('amount');
            if ($paid + $amount > (float) $enrollment->final_course_fee) throw ValidationException::withMessages(['amount' => ['Payment exceeds remaining enrollment balance.']]);
            $installmentId = $request->validated('installment_id');
            if ($installmentId) {
                $installment = FeeInstallment::where('institute_id', $instituteId)->lockForUpdate()->findOrFail($installmentId);
                if ($installment->enrollment_id !== $enrollment->id) throw ValidationException::withMessages(['installment_id' => ['Installment does not belong to selected enrollment.']]);
                if ((float) $installment->paid_amount + $amount > (float) $installment->amount) throw ValidationException::withMessages(['amount' => ['Payment exceeds installment balance.']]);
                $installment->paid_amount = (float) $installment->paid_amount + $amount;
                $installment->status = (float) $installment->paid_amount >= (float) $installment->amount ? 'paid' : 'partially_paid';
                $installment->save();
            }
            return Payment::create([...$request->validated(), 'institute_id' => $instituteId, 'student_id' => $enrollment->student_id, 'receipt_number' => $this->nextReceipt($instituteId), 'received_by' => $request->user()->id]);
        });
        $payment->load(['student','enrollment.course','enrollment.batch','installment','receiver']);
        $this->activity->log($request, 'payment.received', $payment, "Payment {$payment->receipt_number} received from {$payment->student->full_name}.", [
            'receipt_number' => $payment->receipt_number,
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'enrollment_id' => $payment->enrollment_id,
        ]);

        return $this->success(new PaymentResource($payment), 'Payment received.', 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        abort_unless($payment->institute_id === $request->user()->institute_id, 403);
        $enrollment = $payment->enrollment;
        $paid = Payment::where('institute_id', $request->user()->institute_id)->where('enrollment_id', $enrollment->id)->sum('amount');
        return $this->success(['payment' => new PaymentResource($payment->load(['student','enrollment.course','enrollment.batch','installment','receiver'])), 'institute' => Institute::find($payment->institute_id), 'remaining_balance' => number_format(max(0, (float) $enrollment->final_course_fee - (float) $paid), 2, '.', '')], 'Receipt retrieved.');
    }

    public function outstanding(Request $request, Enrollment $enrollment): JsonResponse
    {
        abort_unless($enrollment->institute_id === $request->user()->institute_id, 403);
        $paid = Payment::where('institute_id', $request->user()->institute_id)->where('enrollment_id', $enrollment->id)->sum('amount');
        return $this->success(['total_fee' => $enrollment->final_course_fee, 'total_paid' => number_format((float)$paid,2,'.',''), 'remaining_balance' => number_format(max(0,(float)$enrollment->final_course_fee-(float)$paid),2,'.','')], 'Outstanding retrieved.');
    }

    private function nextReceipt(int $instituteId): string
    {
        $last = Payment::where('institute_id',$instituteId)->lockForUpdate()->latest('id')->value('receipt_number');
        return 'RCP-'.str_pad((string)($last ? ((int)str_replace('RCP-','',$last))+1 : 1), 6, '0', STR_PAD_LEFT);
    }
}
