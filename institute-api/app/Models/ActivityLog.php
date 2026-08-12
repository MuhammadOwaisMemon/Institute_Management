<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['institute_id', 'user_id', 'action', 'entity_type', 'entity_id', 'description', 'metadata'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }

    public function institute(): BelongsTo { return $this->belongsTo(Institute::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
