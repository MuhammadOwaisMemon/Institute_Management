<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'user_id',
        'employee_code',
        'first_name',
        'last_name',
        'gender',
        'phone',
        'email',
        'cnic',
        'address',
        'joining_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'joining_date' => 'date',
        ];
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.($this->last_name ?? ''));
    }
}
