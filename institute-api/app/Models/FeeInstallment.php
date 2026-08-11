<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeInstallment extends Model
{
    use HasFactory;

    protected $fillable = ['institute_id', 'enrollment_id', 'title', 'due_date', 'amount', 'paid_amount', 'status'];

    protected function casts(): array
    {
        return ['due_date' => 'date', 'amount' => 'decimal:2', 'paid_amount' => 'decimal:2'];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}
