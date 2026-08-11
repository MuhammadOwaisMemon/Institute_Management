<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool { return in_array($this->user()?->role, ['admin', 'receptionist'], true); }
    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', Rule::exists('enrollments', 'id')->where('institute_id', $this->user()->institute_id)],
            'installment_id' => ['nullable', Rule::exists('fee_installments', 'id')->where('institute_id', $this->user()->institute_id)],
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', Rule::in(['cash', 'bank_transfer', 'jazzcash', 'easypaisa', 'other'])],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
