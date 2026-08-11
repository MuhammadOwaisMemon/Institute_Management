<?php

namespace App\Policies;

use App\Models\Teacher;
use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function view(User $user, Teacher $teacher): bool
    {
        if ($user->institute_id !== $teacher->institute_id) {
            return false;
        }

        return in_array($user->role, ['admin', 'receptionist'], true)
            || ($user->role === 'teacher' && $teacher->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist'], true);
    }

    public function update(User $user, Teacher $teacher): bool
    {
        return $user->institute_id === $teacher->institute_id
            && in_array($user->role, ['admin', 'receptionist'], true);
    }
}
