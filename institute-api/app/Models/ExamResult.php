<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = ['institute_id', 'exam_id', 'student_id', 'obtained_marks', 'percentage', 'grade', 'remarks'];

    protected function casts(): array
    {
        return ['obtained_marks' => 'decimal:2', 'percentage' => 'decimal:2'];
    }

    public function institute(): BelongsTo { return $this->belongsTo(Institute::class); }
    public function exam(): BelongsTo { return $this->belongsTo(Exam::class); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
}
