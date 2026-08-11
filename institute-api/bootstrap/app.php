<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use App\Support\ApiResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e) {
            return ApiResponse::error('The given data was invalid.', $e->errors(), 422);
        });

        $exceptions->render(function (AuthenticationException $e) {
            return ApiResponse::error('Unauthenticated.', [], 401);
        });

        $exceptions->render(function (ModelNotFoundException $e) {
            return ApiResponse::error('Resource not found.', [], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $e) {
            return ApiResponse::error($e->getMessage() ?: 'Request failed.', [], $e->getStatusCode());
        });
    })
    ->booted(function (): void {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().'|'.strtolower((string) $request->input('email')));
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip().'|'.strtolower((string) $request->input('email')));
        });
    })
    ->create();
