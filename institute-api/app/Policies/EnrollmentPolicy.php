<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    public function viewAny(User $user): bool { return in_array($user->role, ['admin', 'receptionist'], true); }
    public function view(User $user, Enrollment $enrollment): bool { return $user->institute_id === $enrollment->institute_id && $this->viewAny($user); }
    public function create(User $user): bool { return in_array($user->role, ['admin', 'receptionist'], true); }
}
