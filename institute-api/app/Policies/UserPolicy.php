<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $target): bool
    {
        return $user->isAdmin() && $user->institute_id === $target->institute_id;
    }

    public function delete(User $user, User $target): bool
    {
        return $user->isAdmin() && $user->institute_id === $target->institute_id && $user->id !== $target->id;
    }
}
