<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id', 'student_id', 'course_id', 'batch_id', 'enrollment_date',
        'agreed_course_fee', 'admission_fee', 'discount_type', 'discount_value',
        'final_course_fee', 'status', 'completion_date', 'notes',
    ];

    protected function casts(): array
    {
        return ['enrollment_date' => 'date', 'completion_date' => 'date', 'agreed_course_fee' => 'decimal:2', 'admission_fee' => 'decimal:2', 'discount_value' => 'decimal:2', 'final_course_fee' => 'decimal:2'];
    }

    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
    public function batch(): BelongsTo { return $this->belongsTo(Batch::class); }
    public function installments(): HasMany { return $this->hasMany(FeeInstallment::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }
}
