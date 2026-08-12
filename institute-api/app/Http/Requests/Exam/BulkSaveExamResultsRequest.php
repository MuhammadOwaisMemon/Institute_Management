<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class BulkSaveExamResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function rules(): array
    {
        return [
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer'],
            'records.*.obtained_marks' => ['required', 'numeric', 'min:0'],
            'records.*.grade' => ['nullable', 'string', 'max:30'],
            'records.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
