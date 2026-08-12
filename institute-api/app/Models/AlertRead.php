<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertRead extends Model
{
    protected $fillable = ['institute_id', 'user_id', 'alert_key', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function institute(): BelongsTo { return $this->belongsTo(Institute::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
