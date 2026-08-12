<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BatchResource;
use App\Http\Resources\EnrollmentResource;
use App\Http\Resources\FeeInstallmentResource;
use App\Http\Resources\PaymentResource;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends ApiController
{
    private const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    public function show(Request $request): JsonResponse
    {
        $instituteId = $request->user()->institute_id;
        $today = now();
        $monthStart = $today->copy()->startOfMonth()->toDateString();
        $monthEnd = $today->copy()->endOfMonth()->toDateString();

        $this->refreshOverdue($instituteId);

        $todayClasses = $this->todayClassesQuery($request)
            ->limit(6)
            ->get();
        $todayClassesCount = $this->todayClassesQuery($request, false)->count();
        $studentCounts = Student::query()
            ->where('institute_id', $instituteId)
            ->selectRaw('count(*) as total_students')
            ->selectRaw("sum(case when status = 'active' then 1 else 0 end) as active_students")
            ->first();

        $recentAdmissions = Enrollment::query()
            ->with(['student', 'course', 'batch'])
            ->where('institute_id', $instituteId)
            ->latest('enrollment_date')
            ->latest('id')
            ->limit(6)
            ->get();

        $recentPayments = Payment::query()
            ->with(['student', 'enrollment.course', 'enrollment.batch'])
            ->where('institute_id', $instituteId)
            ->latest('payment_date')
            ->latest('id')
            ->limit(6)
            ->get();

        $pendingFees = FeeInstallment::query()
            ->with(['enrollment.student', 'enrollment.course', 'enrollment.batch'])
            ->where('institute_id', $instituteId)
            ->whereIn('status', ['pending', 'partially_paid', 'overdue'])
            ->orderByRaw("case when status = 'overdue' then 0 else 1 end")
            ->orderBy('due_date')
            ->limit(6)
            ->get();

        return $this->success([
            'kpis' => [
                'total_students' => (int) ($studentCounts?->total_students ?? 0),
                'active_students' => (int) ($studentCounts?->active_students ?? 0),
                'active_batches' => Batch::where('institute_id', $instituteId)->where('status', 'active')->count(),
                'todays_classes' => $todayClassesCount,
                'this_month_collection' => $this->money(Payment::where('institute_id', $instituteId)->whereBetween('payment_date', [$monthStart, $monthEnd])->sum('amount')),
                'pending_fees' => $this->money(FeeInstallment::where('institute_id', $instituteId)->whereIn('status', ['pending', 'partially_paid', 'overdue'])->selectRaw('coalesce(sum(amount - paid_amount), 0) as pending')->value('pending')),
            ],
            'today_classes' => BatchResource::collection($todayClasses)->resolve(),
            'recent_admissions' => EnrollmentResource::collection($recentAdmissions)->resolve(),
            'recent_payments' => PaymentResource::collection($recentPayments)->resolve(),
            'pending_fees' => FeeInstallmentResource::collection($pendingFees)->resolve(),
            'monthly_fee_collection' => $this->monthlyFeeCollection($instituteId),
        ], 'Dashboard retrieved.');
    }

    private function todayClassesQuery(Request $request, bool $withRelations = true)
    {
        $user = $request->user();
        $weekday = strtolower(now()->format('l'));

        return Batch::query()
            ->when($withRelations, fn ($query) => $query->with(['course', 'teacher']))
            ->where('institute_id', $user->institute_id)
            ->where('status', 'active')
            ->whereJsonContains('weekdays', $weekday)
            ->when($user->role === 'teacher', fn ($query) => $query->whereHas('teacher', fn ($query) => $query->where('user_id', $user->id)))
            ->orderBy('start_time');
    }

    private function monthlyFeeCollection(int $instituteId): array
    {
        $start = now()->copy()->startOfMonth()->subMonths(5);
        $payments = Payment::query()
            ->where('institute_id', $instituteId)
            ->whereDate('payment_date', '>=', $start->toDateString())
            ->selectRaw('substr(payment_date, 1, 7) as month')
            ->selectRaw('coalesce(sum(amount), 0) as total')
            ->groupBy('month')
            ->pluck('total', 'month');

        return collect(range(0, 5))->map(function (int $offset) use ($start, $payments) {
            $month = $start->copy()->addMonths($offset);
            $key = $month->format('Y-m');
            return [
                'month' => $key,
                'label' => $month->format('M Y'),
                'amount' => $this->money($payments->get($key, 0)),
            ];
        })->all();
    }

    private function refreshOverdue(int $instituteId): void
    {
        FeeInstallment::where('institute_id', $instituteId)
            ->whereIn('status', ['pending', 'partially_paid'])
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
