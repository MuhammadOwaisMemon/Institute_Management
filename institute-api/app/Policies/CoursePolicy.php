<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function view(User $user, Course $course): bool
    {
        return $user->institute_id === $course->institute_id
            && in_array($user->role, ['admin', 'receptionist', 'teacher'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'receptionist'], true);
    }

    public function update(User $user, Course $course): bool
    {
        return $user->institute_id === $course->institute_id
            && in_array($user->role, ['admin', 'receptionist'], true);
    }
}
