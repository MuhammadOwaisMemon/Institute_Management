<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'student_id' => $this->student_id,
            'course_id' => $this->course_id,
            'batch_id' => $this->batch_id,
            'enrollment_date' => $this->enrollment_date?->toDateString(),
            'agreed_course_fee' => $this->agreed_course_fee,
            'admission_fee' => $this->admission_fee,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'final_course_fee' => $this->final_course_fee,
            'status' => $this->status,
            'completion_date' => $this->completion_date?->toDateString(),
            'notes' => $this->notes,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'course' => $this->whenLoaded('course', fn () => new CourseResource($this->course)),
            'batch' => $this->whenLoaded('batch', fn () => new BatchResource($this->batch)),
        ];
    }
}
