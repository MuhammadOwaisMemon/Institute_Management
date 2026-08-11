<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('course')) ?? false;
    }

    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('courses')->where('institute_id', $this->user()->institute_id)->ignore($course)],
            'description' => ['nullable', 'string', 'max:1000'],
            'duration_value' => ['nullable', 'integer', 'min:1', 'max:999'],
            'duration_unit' => ['nullable', Rule::in(['days', 'weeks', 'months']), 'required_with:duration_value'],
            'standard_fee' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'admission_fee' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
