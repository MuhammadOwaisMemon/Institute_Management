<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id', 'enrollment_id', 'student_id', 'course_id',
        'certificate_number', 'issue_date', 'completion_date', 'remarks',
    ];

    protected function casts(): array
    {
        return ['issue_date' => 'date', 'completion_date' => 'date'];
    }

    public function institute(): BelongsTo { return $this->belongsTo(Institute::class); }
    public function enrollment(): BelongsTo { return $this->belongsTo(Enrollment::class); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
}
