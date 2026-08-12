<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'batch_id' => $this->batch_id,
            'title' => $this->title,
            'exam_date' => $this->exam_date?->toDateString(),
            'total_marks' => $this->total_marks,
            'passing_marks' => $this->passing_marks,
            'status' => $this->status,
            'batch' => $this->whenLoaded('batch', fn () => new BatchResource($this->batch)),
            'results' => $this->whenLoaded('results', fn () => ExamResultResource::collection($this->results)),
        ];
    }
}
