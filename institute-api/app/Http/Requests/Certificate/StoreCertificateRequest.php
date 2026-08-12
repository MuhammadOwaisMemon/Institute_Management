<?php

namespace App\Http\Requests\Certificate;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'receptionist'], true);
    }

    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'integer'],
            'issue_date' => ['required', 'date'],
            'completion_date' => ['required', 'date'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
