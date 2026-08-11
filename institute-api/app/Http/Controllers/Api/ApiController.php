<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function success(mixed $data = null, string $message = 'Action completed successfully.', int $status = 200, array $meta = []): JsonResponse
    {
        return ApiResponse::success($data, $message, $status, $meta);
    }

    protected function error(string $message = 'Something went wrong.', array $errors = [], int $status = 400): JsonResponse
    {
        return ApiResponse::error($message, $errors, $status);
    }
}
