<?php

namespace App\Http\Requests\Institute;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInstituteProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'short_name' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'email' => ['nullable', 'email:rfc,dns', 'max:150'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'currency' => ['required', Rule::in(['PKR'])],
            'timezone' => ['required', Rule::in(['Asia/Karachi'])],
            'receipt_footer' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
