<?php

namespace App\Http\Requests\FeeInstallment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeeInstallmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'receptionist'], true);
    }

    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', Rule::exists('enrollments', 'id')->where('institute_id', $this->user()->institute_id)],
            'title' => ['required', 'string', 'max:150'],
            'due_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:1'],
        ];
    }
}
