<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'institute_id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function permissions(): array
    {
        return match ($this->role) {
            'admin' => ['*'],
            'receptionist' => [
                'teachers',
                'students',
                'admissions',
                'courses',
                'courses.view',
                'batches',
                'batches.view',
                'schedule',
                'attendance',
                'fees',
                'payments',
                'reports.allowed',
            ],
            'teacher' => [
                'courses.view',
                'teachers.own',
                'batches.own',
                'schedule',
                'students',
                'students.own',
                'attendance',
                'results.later',
            ],
            default => [],
        };
    }
}
