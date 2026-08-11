<?php

namespace App\Http\Requests\Enrollment;

use App\Models\Enrollment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Enrollment::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required_without:student', Rule::exists('students', 'id')->where('institute_id', $this->user()->institute_id)],
            'student' => ['required_without:student_id', 'array'],
            'student.first_name' => ['required_with:student', 'string', 'max:100'],
            'student.last_name' => ['nullable', 'string', 'max:100'],
            'student.phone' => ['required_with:student', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'student.joining_date' => ['required_with:student', 'date'],
            'student.status' => ['required_with:student', Rule::in(['active', 'completed', 'dropped', 'inactive'])],
            'course_id' => ['required', Rule::exists('courses', 'id')->where('institute_id', $this->user()->institute_id)],
            'batch_id' => ['required', Rule::exists('batches', 'id')->where('institute_id', $this->user()->institute_id)],
            'enrollment_date' => ['required', 'date'],
            'agreed_course_fee' => ['required', 'numeric', 'min:0'],
            'admission_fee' => ['nullable', 'numeric', 'min:0'],
            'discount_type' => ['nullable', Rule::in(['fixed', 'percentage'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['active', 'completed', 'dropped', 'cancelled'])],
            'completion_date' => ['nullable', 'date', 'after_or_equal:enrollment_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
