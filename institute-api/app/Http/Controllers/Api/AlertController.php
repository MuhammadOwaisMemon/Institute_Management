<?php

namespace App\Http\Controllers\Api;

use App\Models\AlertRead;
use App\Models\Batch;
use App\Models\FeeInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $alerts = collect($this->buildAlerts($request))->sortBy('date')->values();
        $read = AlertRead::where('user_id', $request->user()->id)
            ->whereIn('alert_key', $alerts->pluck('key'))
            ->get()
            ->keyBy('alert_key');

        $items = $alerts->map(function (array $alert) use ($read) {
            $readAt = $read->get($alert['key'])?->read_at;

            return [
                ...$alert,
                'read_at' => $readAt?->toISOString(),
                'is_read' => (bool) $readAt,
            ];
        })->values();

        return $this->success([
            'unread_count' => $items->where('is_read', false)->count(),
            'alerts' => $items,
        ], 'Alerts retrieved.');
    }

    public function read(Request $request): JsonResponse
    {
        $validated = $request->validate(['key' => ['required', 'string', 'max:255']]);

        AlertRead::updateOrCreate(
            ['user_id' => $request->user()->id, 'alert_key' => $validated['key']],
            ['institute_id' => $request->user()->institute_id, 'read_at' => now()],
        );

        return $this->success(null, 'Alert marked as read.');
    }

    private function buildAlerts(Request $request): array
    {
        $user = $request->user();
        $alerts = [];

        if (in_array($user->role, ['admin', 'receptionist'], true)) {
            $alerts = [
                ...$alerts,
                ...$this->feeAlerts($request),
            ];
        }

        return [
            ...$alerts,
            ...$this->batchAlerts($request),
        ];
    }

    private function feeAlerts(Request $request): array
    {
        $today = now()->toDateString();
        $items = FeeInstallment::with(['enrollment.student', 'enrollment.course'])
            ->where('institute_id', $request->user()->institute_id)
            ->whereIn('status', ['pending', 'partially_paid', 'overdue'])
            ->whereDate('due_date', '<=', $today)
            ->orderBy('due_date')
            ->limit(12)
            ->get();

        return $items->map(function (FeeInstallment $installment) use ($today) {
            $overdue = $installment->due_date?->toDateString() < $today || $installment->status === 'overdue';
            $remaining = max(0, (float) $installment->amount - (float) $installment->paid_amount);

            return [
                'key' => ($overdue ? 'fee-overdue-' : 'fee-due-today-').$installment->id,
                'type' => $overdue ? 'fee_overdue' : 'installment_due_today',
                'title' => $overdue ? 'Fee overdue' : 'Installment due today',
                'message' => trim(($installment->enrollment?->student?->full_name ?? 'Student').' · '.($installment->enrollment?->course?->name ?? 'Course').' · PKR '.number_format($remaining, 0)),
                'date' => $installment->due_date?->toDateString(),
                'href' => '/fees',
            ];
        })->all();
    }

    private function batchAlerts(Request $request): array
    {
        $user = $request->user();
        $today = now()->toDateString();
        $soon = now()->addDays(7)->toDateString();
        $completionWindow = now()->addDays(14)->toDateString();

        $query = Batch::with('course')
            ->where('institute_id', $user->institute_id)
            ->when($user->role === 'teacher', fn ($query) => $query->whereHas('teacher', fn ($query) => $query->where('user_id', $user->id)));

        $starting = (clone $query)
            ->whereIn('status', ['upcoming', 'active'])
            ->whereBetween('start_date', [$today, $soon])
            ->orderBy('start_date')
            ->limit(6)
            ->get()
            ->map(fn (Batch $batch) => [
                'key' => 'batch-starting-'.$batch->id,
                'type' => 'batch_starting_soon',
                'title' => 'Batch starting soon',
                'message' => trim($batch->name.' · '.($batch->course?->name ?? 'Course')),
                'date' => $batch->start_date?->toDateString(),
                'href' => "/batches/{$batch->id}",
            ]);

        $ending = (clone $query)
            ->where('status', 'active')
            ->whereNotNull('expected_end_date')
            ->whereBetween('expected_end_date', [$today, $completionWindow])
            ->orderBy('expected_end_date')
            ->limit(6)
            ->get()
            ->map(fn (Batch $batch) => [
                'key' => 'batch-completing-'.$batch->id,
                'type' => 'batch_nearing_completion',
                'title' => 'Batch nearing completion',
                'message' => trim($batch->name.' · '.($batch->course?->name ?? 'Course')),
                'date' => $batch->expected_end_date?->toDateString(),
                'href' => "/batches/{$batch->id}",
            ]);

        return collect($starting->all())->merge($ending->all())->all();
    }
}
