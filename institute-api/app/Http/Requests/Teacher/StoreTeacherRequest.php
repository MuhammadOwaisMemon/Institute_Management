<?php

namespace App\Http\Requests\Teacher;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Teacher::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', Rule::exists('users', 'id')->where('institute_id', $this->user()->institute_id)],
            'employee_code' => ['nullable', 'string', 'max:50', Rule::unique('teachers')->where('institute_id', $this->user()->institute_id)],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'cnic' => ['nullable', 'string', 'max:20', 'regex:/^[0-9\-\s]+$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'joining_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
