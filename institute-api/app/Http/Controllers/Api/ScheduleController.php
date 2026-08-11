<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BatchResource;
use App\Models\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class ScheduleController extends ApiController
{
    private const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Batch::class);

        $day = strtolower((string) $request->query('day', ''));
        $teacherId = $request->query('teacher_id');
        $courseId = $request->query('course_id');
        $batchId = $request->query('batch_id');
        $user = $request->user();

        $batches = Batch::query()
            ->with(['course', 'teacher'])
            ->where('institute_id', $user->institute_id)
            ->whereIn('status', ['upcoming', 'active'])
            ->when($user->role === 'teacher', fn ($query) => $query->whereHas('teacher', fn ($query) => $query->where('user_id', $user->id)))
            ->when($teacherId, fn ($query) => $query->where('teacher_id', $teacherId))
            ->when($courseId, fn ($query) => $query->where('course_id', $courseId))
            ->when($batchId, fn ($query) => $query->where('id', $batchId))
            ->when(in_array($day, self::WEEKDAYS, true), fn ($query) => $query->whereJsonContains('weekdays', $day))
            ->orderBy('start_time')
            ->get();

        return $this->success([
            'today' => $this->itemsForDay($batches, $this->todayName()),
            'weekly' => collect(self::WEEKDAYS)->mapWithKeys(fn ($weekday) => [$weekday => $this->itemsForDay($batches, $weekday)]),
            'teacher_schedule' => $batches->groupBy('teacher_id')->map(fn ($items) => [
                'teacher' => $items->first()->teacher,
                'classes' => $this->formatItems($items),
            ])->values(),
            'conflicts' => $this->conflicts($batches),
        ], 'Schedule retrieved.');
    }

    private function todayName(): string
    {
        return strtolower(now()->format('l'));
    }

    private function itemsForDay(Collection $batches, string $weekday): array
    {
        return $this->formatItems($batches->filter(fn (Batch $batch) => in_array($weekday, $batch->weekdays ?? [], true)));
    }

    private function formatItems(Collection $batches): array
    {
        return BatchResource::collection($batches->sortBy('start_time')->values())->resolve();
    }

    private function conflicts(Collection $batches): array
    {
        $warnings = [];
        $items = $batches->values();

        for ($i = 0; $i < $items->count(); $i++) {
            for ($j = $i + 1; $j < $items->count(); $j++) {
                $first = $items[$i];
                $second = $items[$j];
                $sharedDays = array_values(array_intersect($first->weekdays ?? [], $second->weekdays ?? []));

                if ($sharedDays === [] || ! $this->overlaps($first, $second)) {
                    continue;
                }

                if ($first->teacher_id && $first->teacher_id === $second->teacher_id) {
                    $warnings[] = $this->warning('teacher', $first, $second, $sharedDays);
                }

                if ($first->room && $second->room && strtolower($first->room) === strtolower($second->room)) {
                    $warnings[] = $this->warning('room', $first, $second, $sharedDays);
                }
            }
        }

        return $warnings;
    }

    private function overlaps(Batch $first, Batch $second): bool
    {
        return $first->start_time < $second->end_time && $second->start_time < $first->end_time;
    }

    private function warning(string $type, Batch $first, Batch $second, array $days): array
    {
        return [
            'type' => $type,
            'message' => $type === 'teacher' ? 'Teacher has overlapping classes.' : 'Room has overlapping classes.',
            'days' => $days,
            'batches' => [
                new BatchResource($first),
                new BatchResource($second),
            ],
        ];
    }
}
