<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FeeInstallmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\Settings\InstituteProfileController;
use App\Http\Controllers\Api\Settings\UserController;
use App\Support\ApiResponse;

Route::get('/health', function () {
    return ApiResponse::success([
        'service' => 'institute-api',
        'status' => 'ok',
    ], 'API is healthy.');
});

Route::middleware('web')->group(function () {
    Route::middleware('throttle:login')->post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('throttle:password-reset')->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::middleware('throttle:password-reset')->post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/change-password', [AuthController::class, 'changePassword'])->middleware('throttle:6,1');

        Route::get('/user', function (Request $request) {
            return ApiResponse::success($request->user(), 'Authenticated user retrieved.');
        });

        Route::prefix('settings')->group(function () {
            Route::get('/institute-profile', [InstituteProfileController::class, 'show']);
            Route::put('/institute-profile', [InstituteProfileController::class, 'update']);
            Route::post('/institute-profile/logo', [InstituteProfileController::class, 'logo']);

            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{user}', [UserController::class, 'update']);
        });

        Route::apiResource('teachers', TeacherController::class)->except(['destroy']);
        Route::apiResource('courses', CourseController::class)->except(['destroy']);
        Route::apiResource('batches', BatchController::class)->except(['destroy']);
        Route::get('/schedule', [ScheduleController::class, 'index']);
        Route::apiResource('students', StudentController::class)->except(['destroy']);
        Route::post('/students/{student}/photo', [StudentController::class, 'photo']);
        Route::apiResource('enrollments', EnrollmentController::class)->only(['index', 'store', 'show']);
        Route::get('/fees', [FeeInstallmentController::class, 'index']);
        Route::post('/fees/installments', [FeeInstallmentController::class, 'store']);
        Route::get('/enrollments/{enrollment}/fees', [FeeInstallmentController::class, 'summary']);
        Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show']);
        Route::get('/enrollments/{enrollment}/outstanding', [PaymentController::class, 'outstanding']);
        Route::get('/attendance/students', [AttendanceController::class, 'students']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/attendance/batches/{batch}/history', [AttendanceController::class, 'batchHistory']);
        Route::get('/attendance/students/{student}/history', [AttendanceController::class, 'studentHistory']);
        Route::get('/attendance/report', [AttendanceController::class, 'report']);
    });
});
