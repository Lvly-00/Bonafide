<?php

namespace App\Http\Controllers\Api;

use App\Models\TeacherDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends ApiController
{
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'phone' => 'sometimes|string',
            'avatar' => 'sometimes|nullable|string',
            'hourlyRate' => 'sometimes|numeric|min:0',
            'hourly_rate' => 'sometimes|numeric|min:0',
            'bio' => 'sometimes|string',
            'subjects' => 'sometimes|array',
        ]);

        $request->user()->update($request->only(['name', 'email', 'phone', 'avatar']));

        if ($request->user()->role === 'teacher') {
            $rate = $request->input('hourlyRate') ?? $request->input('hourly_rate');
            $updates = [];
            if ($rate !== null) $updates['hourly_rate'] = $rate;
            if ($request->has('bio')) $updates['bio'] = $request->bio;
            if ($request->has('subjects')) $updates['subjects'] = $request->subjects;
            if (!empty($updates)) {
                TeacherDetail::updateOrCreate(
                    ['user_id' => $request->user()->id],
                    $updates
                );
            }
        }

        return response()->json([
            ...$this->userResponse($request->user()->fresh()->load('teacherDetail')),
            'updatedAt' => $request->user()->updated_at,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $password = $request->input('currentPassword') ?? $request->input('current_password');

        if (!Hash::check($password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $newPassword = $request->input('newPassword') ?? $request->input('new_password');
        $request->user()->update(['password' => Hash::make($newPassword)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Preferences updated']);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->user()->delete();
        return response()->json(['message' => 'Account deleted successfully']);
    }
}
