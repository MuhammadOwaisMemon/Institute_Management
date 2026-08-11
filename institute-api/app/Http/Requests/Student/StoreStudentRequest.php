<?php

namespace App\Http\Requests\Student;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Student::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'father_guardian_name' => ['nullable', 'string', 'max:150'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'cnic_bform' => ['nullable', 'string', 'max:20', 'regex:/^[0-9\-\s]+$/'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'alternate_phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'guardian_phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'joining_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['active', 'completed', 'dropped', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
