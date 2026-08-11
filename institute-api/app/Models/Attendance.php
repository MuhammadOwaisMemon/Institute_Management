<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;
    protected $fillable = ['institute_id','batch_id','student_id','attendance_date','status','remarks','marked_by'];
    protected function casts(): array { return ['attendance_date' => 'date']; }
    public function batch(): BelongsTo { return $this->belongsTo(Batch::class); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function marker(): BelongsTo { return $this->belongsTo(User::class, 'marked_by'); }
}
