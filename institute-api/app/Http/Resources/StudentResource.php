<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'student_code' => $this->student_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'father_guardian_name' => $this->father_guardian_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'cnic_bform' => $this->cnic_bform,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,
            'guardian_phone' => $this->guardian_phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'photo' => $this->photo,
            'photo_url' => $this->photo ? Storage::disk('public')->url($this->photo) : null,
            'joining_date' => $this->joining_date?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
