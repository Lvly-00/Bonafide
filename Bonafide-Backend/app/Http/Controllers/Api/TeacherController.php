<?php

namespace App\Http\Controllers\Api;

use App\Models\FavoriteTeacher;
use App\Models\Review;
use App\Models\TeacherDetail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends ApiController
{
    private function formatTeacher($teacher): array
    {
        $detail = $teacher->teacherDetail;
        return [
            'id' => (string) $teacher->id,
            'name' => $teacher->name,
            'email' => $teacher->email,
            'role' => $teacher->role,
            'avatar' => $teacher->avatar,
            'phone' => $teacher->phone,
            'createdAt' => $teacher->created_at,
            'specialization' => $detail?->specialization ?? [],
            'experience' => $detail?->experience ?? 0,
            'rating' => $detail?->rating ?? 0,
            'totalStudents' => $detail?->total_students ?? 0,
            'totalSessions' => $detail?->total_sessions ?? 0,
            'hourlyRate' => $detail?->hourly_rate ?? 0,
            'bio' => $detail?->bio ?? '',
            'availability' => $detail?->availability ?? [],
            'certificates' => $detail?->certificates ?? [],
            'gallery' => $detail?->gallery ?? [],
            'subjects' => $detail?->subjects ?? [],
            'education' => $detail?->education ?? '',
            'languages' => $detail?->languages ?? [],
            'location' => $detail?->location ?? '',
        ];
    }

    public function index(): JsonResponse
    {
        $teachers = User::where('role', 'teacher')
            ->with('teacherDetail')
            ->get()
            ->map(fn ($t) => $this->formatTeacher($t));

        return response()->json($teachers);
    }

    public function show(int $id): JsonResponse
    {
        $teacher = User::where('role', 'teacher')
            ->with('teacherDetail')
            ->findOrFail($id);

        return response()->json($this->formatTeacher($teacher));
    }

    public function reviews(int $id): JsonResponse
    {
        $reviews = Review::where('teacher_id', $id)
            ->with('parent')
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'teacherId' => (string) $r->teacher_id,
                'parentId' => (string) $r->parent_id,
                'parentName' => $r->parent->name,
                'parentAvatar' => $r->parent->avatar,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'date' => $r->created_at,
            ]);

        return response()->json($reviews);
    }

    public function storeReview(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'teacher_id' => $id,
            'parent_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment ?? '',
            'recommend' => $request->rating >= 3,
            'book_again' => $request->rating >= 3,
        ]);

        // Update teacher rating
        $avg = Review::where('teacher_id', $id)->avg('rating');
        TeacherDetail::where('user_id', $id)->update(['rating' => round($avg ?? 0, 1)]);

        return response()->json([
            'id' => (string) $review->id,
            'parentName' => $request->user()->name,
            'parentAvatar' => $request->user()->avatar,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'date' => $review->created_at,
        ], 201);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'availability' => 'required|array',
            'availability.*.day' => 'required|string',
            'availability.*.slots' => 'required|array',
            'availability.*.slots.*.start' => 'required|string',
            'availability.*.slots.*.end' => 'required|string',
        ]);

        $user = $request->user();
        if ($user->role !== 'teacher') {
            return response()->json(['message' => 'Only teachers can set availability'], 403);
        }

        TeacherDetail::updateOrCreate(
            ['user_id' => $user->id],
            ['availability' => $request->availability]
        );

        return response()->json(['message' => 'Availability updated', 'availability' => $request->availability]);
    }

    public function getAvailability(Request $request): JsonResponse
    {
        $detail = TeacherDetail::where('user_id', $request->user()->id)->first();
        return response()->json(['availability' => $detail?->availability ?? []]);
    }

    public function favorite(int $id, Request $request): JsonResponse
    {
        FavoriteTeacher::firstOrCreate([
            'user_id' => $request->user()->id,
            'teacher_id' => $id,
        ]);
        return response()->json(['message' => 'Teacher added to favorites']);
    }

    public function unfavorite(int $id, Request $request): JsonResponse
    {
        FavoriteTeacher::where('user_id', $request->user()->id)
            ->where('teacher_id', $id)
            ->delete();
        return response()->json(['message' => 'Teacher removed from favorites']);
    }

    public function favorites(Request $request): JsonResponse
    {
        $ids = FavoriteTeacher::where('user_id', $request->user()->id)
            ->pluck('teacher_id')
            ->map(fn ($id) => (string) $id);
        return response()->json($ids);
    }
}
