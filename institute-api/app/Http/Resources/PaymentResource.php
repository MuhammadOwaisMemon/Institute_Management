<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt_number,
            'amount' => $this->amount,
            'payment_date' => $this->payment_date?->toDateString(),
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'notes' => $this->notes,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'enrollment' => $this->whenLoaded('enrollment', fn () => new EnrollmentResource($this->enrollment)),
            'installment' => $this->whenLoaded('installment', fn () => new FeeInstallmentResource($this->installment)),
            'receiver' => $this->whenLoaded('receiver', fn () => new UserResource($this->receiver)),
        ];
    }
}
