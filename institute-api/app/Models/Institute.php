<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_name',
        'logo',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'currency',
        'timezone',
        'receipt_footer',
        'status',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
