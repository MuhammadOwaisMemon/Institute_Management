<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function rules(): array
    {
        return [
            'batch_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'exam_date' => ['required', 'date'],
            'total_marks' => ['required', 'numeric', 'min:1'],
            'passing_marks' => ['nullable', 'numeric', 'min:0', 'lte:total_marks'],
            'status' => ['required', Rule::in(['scheduled', 'completed', 'cancelled'])],
        ];
    }
}
