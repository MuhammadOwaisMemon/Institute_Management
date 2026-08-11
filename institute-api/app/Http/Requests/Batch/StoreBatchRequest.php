<?php

namespace App\Http\Requests\Batch;

use App\Models\Batch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Batch::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', Rule::exists('courses', 'id')->where('institute_id', $this->user()->institute_id)],
            'teacher_id' => ['nullable', Rule::exists('teachers', 'id')->where('institute_id', $this->user()->institute_id)],
            'name' => ['required', 'string', 'max:150'],
            'batch_code' => ['nullable', 'string', 'max:50', Rule::unique('batches')->where('institute_id', $this->user()->institute_id)],
            'start_date' => ['required', 'date'],
            'expected_end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'room' => ['nullable', 'string', 'max:100'],
            'weekdays' => ['required', 'array', 'min:1'],
            'weekdays.*' => ['required', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'status' => ['required', Rule::in(['upcoming', 'active', 'completed', 'cancelled'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
