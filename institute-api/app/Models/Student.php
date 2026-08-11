<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id', 'student_code', 'first_name', 'last_name', 'father_guardian_name',
        'gender', 'date_of_birth', 'cnic_bform', 'phone', 'alternate_phone',
        'guardian_phone', 'email', 'address', 'city', 'photo', 'joining_date',
        'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joining_date' => 'date',
        ];
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.($this->last_name ?? ''));
    }
}
