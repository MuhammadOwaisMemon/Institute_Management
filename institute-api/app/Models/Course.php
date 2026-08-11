<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'name',
        'code',
        'description',
        'duration_value',
        'duration_unit',
        'standard_fee',
        'admission_fee',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'standard_fee' => 'decimal:2',
            'admission_fee' => 'decimal:2',
        ];
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}
