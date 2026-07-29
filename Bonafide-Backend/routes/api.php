<?php

use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChildController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/{role}', [DashboardController::class, 'index']);

    Route::apiResource('children', ChildController::class);
    Route::get('/children/{id}/recommended-teachers', [ChildController::class, 'recommendedTeachers']);
    Route::get('/children/{id}/learning-profile', [ChildController::class, 'learningProfile']);
    Route::get('/teachers', [TeacherController::class, 'index']);
    Route::patch('/teachers/availability', [TeacherController::class, 'updateAvailability']);
    Route::get('/teachers/availability', [TeacherController::class, 'getAvailability']);
    Route::get('/teachers/{id}', [TeacherController::class, 'show']);
    Route::get('/teachers/{id}/reviews', [TeacherController::class, 'reviews']);
    Route::post('/teachers/{id}/reviews', [TeacherController::class, 'storeReview']);
    Route::post('/teachers/{id}/favorite', [TeacherController::class, 'favorite']);
    Route::delete('/teachers/{id}/favorite', [TeacherController::class, 'unfavorite']);
    Route::get('/favorites', [TeacherController::class, 'favorites']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/parent-feedback/{childId}', [BookingController::class, 'parentFeedbackByChild']);
    Route::get('/bookings/session-assessments/{childId}', [BookingController::class, 'sessionAssessments']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::post('/bookings/{id}/feedback', [BookingController::class, 'submitFeedback']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    Route::get('/assessments/{childId}', [AssessmentController::class, 'show']);
    Route::get('/assessment-questions', [AssessmentController::class, 'questions']);
    Route::post('/assessments/{childId}/submit', [AssessmentController::class, 'submit']);
    Route::post('/assessments/{childId}/progress', [AssessmentController::class, 'saveProgress']);

    Route::post('/ai/suggestions', [AIController::class, 'suggestions']);

    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{conversationId}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'send']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::get('/progress/{childId}', [ProgressController::class, 'index']);
    Route::get('/progress/{childId}/passport', [ProgressController::class, 'passport']);

    Route::patch('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::post('/settings/change-password', [SettingsController::class, 'changePassword']);
    Route::post('/settings/notification-preferences', [SettingsController::class, 'updateNotificationPreferences']);
    Route::delete('/settings/account', [SettingsController::class, 'deleteAccount']);
});
