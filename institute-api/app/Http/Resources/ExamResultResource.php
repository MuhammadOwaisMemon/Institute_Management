<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'exam_id' => $this->exam_id,
            'student_id' => $this->student_id,
            'obtained_marks' => $this->obtained_marks,
            'percentage' => $this->percentage,
            'grade' => $this->grade,
            'remarks' => $this->remarks,
            'exam' => $this->whenLoaded('exam', fn () => new ExamResource($this->exam)),
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
        ];
    }
}
