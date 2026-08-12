<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ActivityLogController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $search = (string) $request->query('search', '');
        $items = ActivityLog::with('user')
            ->where('institute_id', $request->user()->institute_id)
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('description', 'like', "%{$search}%")
                ->orWhere('action', 'like', "%{$search}%")
                ->orWhere('entity_type', 'like', "%{$search}%")))
            ->when($request->query('user_id'), fn ($query, $value) => $query->where('user_id', $value))
            ->when($request->query('action'), fn ($query, $value) => $query->where('action', $value))
            ->when($request->query('date'), fn ($query, $value) => $query->whereDate('created_at', $value))
            ->latest('created_at')
            ->paginate(min(max((int) $request->query('per_page', 15), 1), 100));

        return $this->success(ActivityLogResource::collection($items)->resolve(), 'Activity logs retrieved.', meta: [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }
}
