<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkSaveAttendanceRequest extends FormRequest
{
    public function authorize(): bool { return in_array($this->user()?->role, ['admin','receptionist','teacher'], true); }
    public function rules(): array
    {
        return [
            'batch_id' => ['required', Rule::exists('batches','id')->where('institute_id', $this->user()->institute_id)],
            'attendance_date' => ['required','date'],
            'records' => ['required','array','min:1'],
            'records.*.student_id' => ['required', Rule::exists('students','id')->where('institute_id', $this->user()->institute_id)],
            'records.*.status' => ['required', Rule::in(['present','absent','leave'])],
            'records.*.remarks' => ['nullable','string','max:500'],
        ];
    }
}
