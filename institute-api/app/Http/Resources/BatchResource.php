<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'course_id' => $this->course_id,
            'teacher_id' => $this->teacher_id,
            'name' => $this->name,
            'batch_code' => $this->batch_code,
            'start_date' => $this->start_date?->toDateString(),
            'expected_end_date' => $this->expected_end_date?->toDateString(),
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'capacity' => $this->capacity,
            'room' => $this->room,
            'weekdays' => $this->weekdays ?? [],
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'course' => $this->whenLoaded('course', fn () => new CourseResource($this->course)),
            'teacher' => $this->whenLoaded('teacher', fn () => new TeacherResource($this->teacher)),
        ];
    }
}
