<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'enrollment_id' => $this->enrollment_id,
            'student_id' => $this->student_id,
            'course_id' => $this->course_id,
            'certificate_number' => $this->certificate_number,
            'issue_date' => $this->issue_date?->toDateString(),
            'completion_date' => $this->completion_date?->toDateString(),
            'remarks' => $this->remarks,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'course' => $this->whenLoaded('course', fn () => new CourseResource($this->course)),
            'enrollment' => $this->whenLoaded('enrollment', fn () => new EnrollmentResource($this->enrollment)),
            'institute' => $this->whenLoaded('institute', fn () => new InstituteResource($this->institute)),
        ];
    }
}
