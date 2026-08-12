<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = ['institute_id', 'batch_id', 'title', 'exam_date', 'total_marks', 'passing_marks', 'status'];

    protected function casts(): array
    {
        return ['exam_date' => 'date', 'total_marks' => 'decimal:2', 'passing_marks' => 'decimal:2'];
    }

    public function institute(): BelongsTo { return $this->belongsTo(Institute::class); }
    public function batch(): BelongsTo { return $this->belongsTo(Batch::class); }
    public function results(): HasMany { return $this->hasMany(ExamResult::class); }
}
