<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;
    protected $fillable = ['institute_id','student_id','enrollment_id','installment_id','receipt_number','amount','payment_date','payment_method','reference_number','notes','received_by'];
    protected function casts(): array { return ['amount' => 'decimal:2', 'payment_date' => 'date']; }
    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function enrollment(): BelongsTo { return $this->belongsTo(Enrollment::class); }
    public function installment(): BelongsTo { return $this->belongsTo(FeeInstallment::class, 'installment_id'); }
    public function receiver(): BelongsTo { return $this->belongsTo(User::class, 'received_by'); }
}
