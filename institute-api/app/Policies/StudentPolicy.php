<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function view(User $user, Student $student): bool
    {
        return $user->institute_id === $student->institute_id
            && in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist'], true);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->institute_id === $student->institute_id
            && in_array($user->role, ['admin', 'receptionist'], true);
    }
}
