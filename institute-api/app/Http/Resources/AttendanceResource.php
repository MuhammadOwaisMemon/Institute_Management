<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,'batch_id'=>$this->batch_id,'student_id'=>$this->student_id,
            'attendance_date'=>$this->attendance_date?->toDateString(),'status'=>$this->status,'remarks'=>$this->remarks,
            'student'=>$this->whenLoaded('student', fn()=>new StudentResource($this->student)),
            'batch'=>$this->whenLoaded('batch', fn()=>new BatchResource($this->batch)),
        ];
    }
}
