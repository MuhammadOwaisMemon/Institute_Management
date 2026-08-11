<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'user_id' => $this->user_id,
            'employee_code' => $this->employee_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'phone' => $this->phone,
            'email' => $this->email,
            'cnic' => $this->cnic,
            'address' => $this->address,
            'joining_date' => $this->joining_date?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
        ];
    }
}
