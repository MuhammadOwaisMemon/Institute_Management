<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Institute\UpdateInstituteProfileRequest;
use App\Http\Requests\Institute\UploadInstituteLogoRequest;
use App\Http\Resources\InstituteResource;
use App\Services\InstituteSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InstituteProfileController extends ApiController
{
    public function __construct(private readonly InstituteSettingsService $service)
    {
    }

    public function show(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', \App\Models\User::class);

        return $this->success(
            new InstituteResource($this->service->profile()),
            'Institute profile retrieved.',
        );
    }

    public function update(UpdateInstituteProfileRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', \App\Models\User::class);

        return $this->success(
            new InstituteResource($this->service->updateProfile($request->validated())),
            'Institute profile updated.',
        );
    }

    public function logo(UploadInstituteLogoRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', \App\Models\User::class);

        return $this->success(
            new InstituteResource($this->service->updateLogo($request->file('logo'))),
            'Institute logo updated.',
        );
    }
}
