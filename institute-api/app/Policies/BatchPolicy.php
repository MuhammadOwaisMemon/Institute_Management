<?php

namespace App\Policies;

use App\Models\Batch;
use App\Models\User;

class BatchPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function view(User $user, Batch $batch): bool
    {
        if ($user->institute_id !== $batch->institute_id) {
            return false;
        }

        return in_array($user->role, ['admin', 'receptionist'], true)
            || ($user->role === 'teacher' && $batch->teacher?->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist'], true);
    }

    public function update(User $user, Batch $batch): bool
    {
        return $user->institute_id === $batch->institute_id
            && in_array($user->role, ['admin', 'receptionist'], true);
    }
}
