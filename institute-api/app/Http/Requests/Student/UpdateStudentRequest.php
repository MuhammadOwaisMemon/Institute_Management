<?php

namespace App\Http\Requests\Student;

class UpdateStudentRequest extends StoreStudentRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('student')) ?? false;
    }
}
