<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeeInstallmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'enrollment_id' => $this->enrollment_id,
            'title' => $this->title,
            'due_date' => $this->due_date?->toDateString(),
            'amount' => $this->amount,
            'paid_amount' => $this->paid_amount,
            'status' => $this->status,
            'enrollment' => $this->whenLoaded('enrollment', fn () => new EnrollmentResource($this->enrollment)),
        ];
    }
}
