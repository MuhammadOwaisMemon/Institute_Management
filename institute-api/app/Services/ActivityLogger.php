<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ActivityLogger
{
    public function log(Request $request, string $action, Model $entity, string $description, ?array $metadata = null): void
    {
        ActivityLog::create([
            'institute_id' => $request->user()->institute_id,
            'user_id' => $request->user()->id,
            'action' => $action,
            'entity_type' => class_basename($entity),
            'entity_id' => $entity->getKey(),
            'description' => $description,
            'metadata' => $this->clean($metadata),
        ]);
    }

    private function clean(?array $metadata): ?array
    {
        if ($metadata === null) {
            return null;
        }

        unset($metadata['password'], $metadata['password_confirmation'], $metadata['remember_token'], $metadata['token']);

        return $metadata;
    }
}
