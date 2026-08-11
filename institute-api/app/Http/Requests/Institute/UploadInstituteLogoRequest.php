<?php

namespace App\Http\Requests\Institute;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadInstituteLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'logo' => [
                'required',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->min('1kb')
                    ->max('2mb')
                    ->dimensions(
                        minWidth: 80,
                        minHeight: 80,
                        maxWidth: 2000,
                        maxHeight: 2000,
                    ),
            ],
        ];
    }
}
