<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'duration_value' => $this->duration_value,
            'duration_unit' => $this->duration_unit,
            'standard_fee' => $this->standard_fee,
            'admission_fee' => $this->admission_fee,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
