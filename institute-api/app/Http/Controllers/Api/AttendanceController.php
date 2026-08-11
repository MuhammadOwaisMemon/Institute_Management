<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Attendance\BulkSaveAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\StudentResource;
use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends ApiController
{
    public function students(Request $request): JsonResponse
    {
        $batch = $this->authorizedBatch($request, (int) $request->query('batch_id'));
        $date = (string) $request->query('attendance_date', now()->toDateString());
        $students = Enrollment::with('student')->where('batch_id',$batch->id)->where('status','active')->whereDate('enrollment_date','<=',$date)->get()->pluck('student');
        $existing = Attendance::where('batch_id',$batch->id)->whereDate('attendance_date',$date)->get()->keyBy('student_id');
        return $this->success($students->map(fn($s)=>['student'=>new StudentResource($s),'attendance'=>$existing->get($s->id) ? new AttendanceResource($existing->get($s->id)) : null])->values(), 'Attendance students loaded.');
    }

    public function store(BulkSaveAttendanceRequest $request): JsonResponse
    {
        $batch = $this->authorizedBatch($request, (int) $request->validated('batch_id'));
        DB::transaction(function() use ($request,$batch) {
            $date = $request->validated('attendance_date');

            foreach ($request->validated('records') as $record) {
                $attendance = Attendance::where('batch_id',$batch->id)
                    ->where('student_id',$record['student_id'])
                    ->whereDate('attendance_date',$date)
                    ->first() ?? new Attendance([
                        'batch_id' => $batch->id,
                        'student_id' => $record['student_id'],
                        'attendance_date' => $date,
                    ]);

                $attendance->fill([
                    'institute_id'=>$request->user()->institute_id,
                    'status'=>$record['status'],
                    'remarks'=>$record['remarks'] ?? null,
                    'marked_by'=>$request->user()->id,
                ])->save();
            }
        });
        return $this->success(null, 'Attendance saved.');
    }

    public function batchHistory(Request $request, Batch $batch): JsonResponse
    {
        $this->authorizedBatch($request, $batch->id);
        $items = Attendance::with('student')->where('batch_id',$batch->id)->when($request->query('month'), fn($q,$m)=>$q->where('attendance_date','like',"$m%"))->latest('attendance_date')->get();
        return $this->success(AttendanceResource::collection($items)->resolve(), 'Batch attendance history retrieved.');
    }

    public function studentHistory(Request $request, int $studentId): JsonResponse
    {
        $items = Attendance::with('batch.course')->where('institute_id',$request->user()->institute_id)->where('student_id',$studentId)->latest('attendance_date')->get();
        $total = max(1, $items->count());
        $percentage = round(($items->where('status','present')->count() / $total) * 100, 2);
        return $this->success(['percentage'=>$percentage,'records'=>AttendanceResource::collection($items)->resolve()], 'Student attendance history retrieved.');
    }

    public function report(Request $request): JsonResponse
    {
        $batch = $this->authorizedBatch($request, (int) $request->query('batch_id'));
        $month = (string) $request->query('month', now()->format('Y-m'));
        $items = Attendance::with('student')->where('batch_id',$batch->id)->where('attendance_date','like',"$month%")->get()->groupBy('student_id')->map(function($rows){
            $total=max(1,$rows->count()); return ['student'=>new StudentResource($rows->first()->student),'present'=>$rows->where('status','present')->count(),'absent'=>$rows->where('status','absent')->count(),'leave'=>$rows->where('status','leave')->count(),'percentage'=>round(($rows->where('status','present')->count()/$total)*100,2)];
        })->values();
        return $this->success($items, 'Attendance report retrieved.');
    }

    private function authorizedBatch(Request $request, int $batchId): Batch
    {
        $batch = Batch::with('teacher')->where('institute_id',$request->user()->institute_id)->findOrFail($batchId);
        abort_if($request->user()->role === 'teacher' && $batch->teacher?->user_id !== $request->user()->id, 403);
        return $batch;
    }
}
