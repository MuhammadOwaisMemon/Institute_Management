<?php

namespace App\Services;

use App\Models\Institute;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class InstituteSettingsService
{
    public function profile(): Institute
    {
        return Institute::query()->firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Institute Name',
                'country' => 'Pakistan',
                'currency' => 'PKR',
                'timezone' => 'Asia/Karachi',
                'status' => 'active',
            ],
        );
    }

    public function updateProfile(array $data): Institute
    {
        $institute = $this->profile();
        $institute->fill($data);
        $institute->save();

        return $institute->fresh();
    }

    public function updateLogo(UploadedFile $logo): Institute
    {
        $institute = $this->profile();

        if ($institute->logo) {
            Storage::disk('public')->delete($institute->logo);
        }

        $institute->logo = $logo->store('institute-logos', 'public');
        $institute->save();

        return $institute->fresh();
    }
}
