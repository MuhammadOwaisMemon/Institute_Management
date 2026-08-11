<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadStudentPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('student')) ?? false;
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->min('1kb')->max('2mb')->dimensions(maxWidth: 2000, maxHeight: 2000)],
        ];
    }
}
