<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\FeeInstallmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\Settings\InstituteProfileController;
use App\Http\Controllers\Api\Settings\ActivityLogController;
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

        Route::get('/dashboard', [DashboardController::class, 'show']);
        Route::get('/search', SearchController::class);
        Route::get('/alerts', [AlertController::class, 'index']);
        Route::post('/alerts/read', [AlertController::class, 'read']);

        Route::prefix('settings')->group(function () {
            Route::get('/institute-profile', [InstituteProfileController::class, 'show']);
            Route::put('/institute-profile', [InstituteProfileController::class, 'update']);
            Route::post('/institute-profile/logo', [InstituteProfileController::class, 'logo']);

            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        });

        Route::apiResource('teachers', TeacherController::class)->except(['destroy']);
        Route::apiResource('courses', CourseController::class)->except(['destroy']);
        Route::apiResource('batches', BatchController::class)->except(['destroy']);
        Route::get('/schedule', [ScheduleController::class, 'index']);
        Route::apiResource('students', StudentController::class)->except(['destroy']);
        Route::post('/students/{student}/photo', [StudentController::class, 'photo']);
        Route::apiResource('enrollments', EnrollmentController::class)->only(['index', 'store', 'show']);
        Route::patch('/enrollments/{enrollment}/status', [EnrollmentController::class, 'status']);
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
        Route::apiResource('exams', ExamController::class)->only(['index', 'store', 'show']);
        Route::get('/exams/{exam}/students', [ExamController::class, 'students']);
        Route::post('/exams/{exam}/results', [ExamController::class, 'saveResults']);
        Route::get('/students/{student}/results', [ExamController::class, 'studentHistory']);
        Route::get('/batches/{batch}/results', [ExamController::class, 'batchResults']);
        Route::apiResource('certificates', CertificateController::class)->only(['index', 'store', 'show']);
        Route::get('/students/{student}/certificates', [CertificateController::class, 'studentHistory']);

        Route::prefix('reports')->group(function () {
            Route::get('/students', [ReportController::class, 'students']);
            Route::get('/students/export', [ReportController::class, 'studentsCsv']);
            Route::get('/admissions', [ReportController::class, 'admissions']);
            Route::get('/admissions/export', [ReportController::class, 'admissionsCsv']);
            Route::get('/batch-students', [ReportController::class, 'batchStudents']);
            Route::get('/batch-students/export', [ReportController::class, 'batchStudentsCsv']);
            Route::get('/fee-collection', [ReportController::class, 'feeCollection']);
            Route::get('/fee-collection/export', [ReportController::class, 'feeCollectionCsv']);
            Route::get('/pending-fees', [ReportController::class, 'pendingFees']);
            Route::get('/pending-fees/export', [ReportController::class, 'pendingFeesCsv']);
            Route::get('/attendance', [ReportController::class, 'attendance']);
            Route::get('/attendance/export', [ReportController::class, 'attendanceCsv']);
        });
    });
});
