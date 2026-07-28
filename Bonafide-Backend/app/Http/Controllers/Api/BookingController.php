<?php

namespace App\Http\Controllers\Api;

use App\Models\Booking;
use App\Models\Progress;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['child', 'teacher', 'parent']);

        if ($user->role === 'parent') {
            $query->where('parent_id', $user->id);
        } elseif ($user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Auto-complete confirmed sessions whose end time has passed
        foreach ($bookings as $b) {
            if ($b->status === 'confirmed') {
                $endTime = now()->parse($b->date . ' ' . $b->time)->addMinutes($b->duration);
                if (now()->greaterThanOrEqualTo($endTime)) {
                    $b->update(['status' => 'completed']);
                    $b->status = 'completed';
                }
            }
        }

        return response()->json($bookings->map(fn ($b) => $this->formatBooking($b)));
    }

    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['child', 'teacher', 'parent'])->findOrFail($id);
        return response()->json($this->formatBooking($booking));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'teacher_id' => 'sometimes|exists:users,id',
            'teacherId' => 'sometimes|exists:users,id',
            'child_id' => 'sometimes|exists:children,id',
            'childId' => 'sometimes|exists:children,id',
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer',
            'total_amount' => 'sometimes|numeric',
            'totalAmount' => 'sometimes|numeric',
            'session_type' => 'sometimes|string',
            'sessionType' => 'sometimes|string',
            'session_mode' => 'sometimes|string|in:online,face-to-face',
            'sessionMode' => 'sometimes|string|in:online,face-to-face',
            'address' => 'nullable|string',
        ]);

        $teacherId = $request->input('teacher_id') ?? $request->input('teacherId');
        $childId = $request->input('child_id') ?? $request->input('childId');
        $date = $request->date;
        $time = $request->time;

        // Check if this teacher already has a confirmed booking at this time slot
        $existing = Booking::where('teacher_id', $teacherId)
            ->where('date', $date)
            ->where('time', $time)
            ->whereIn('status', ['confirmed', 'pending'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'This time slot is already booked or pending with this teacher'], 409);
        }

        $data = [
            'parent_id' => $request->user()->id,
            'teacher_id' => $teacherId,
            'child_id' => $childId,
            'date' => $date,
            'time' => $time,
            'duration' => $request->duration,
            'total_amount' => $request->input('total_amount') ?? $request->input('totalAmount', 0),
            'session_type' => $request->input('session_type') ?? $request->input('sessionType', 'One-on-One'),
            'session_mode' => $request->input('session_mode') ?? $request->input('sessionMode', 'online'),
            'address' => $request->input('address'),
            'status' => 'pending',
        ];

        $booking = Booking::create($data);
        return response()->json($this->formatBooking($booking), 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|string|in:confirmed,cancelled,completed']);

        $booking = Booking::findOrFail($id);
        $newStatus = $request->status;

        if ($newStatus === 'confirmed') {
            $sessionDate = now()->toDateString();
            $endTime = now()->parse($sessionDate . ' ' . $booking->time)->addMinutes($booking->duration);

            // If session end time already passed, move to next day
            if (now()->greaterThanOrEqualTo($endTime)) {
                $sessionDate = now()->addDay()->toDateString();
            }

            $booking->update(['date' => $sessionDate]);

            Booking::where('child_id', $booking->child_id)
                ->where('date', $sessionDate)
                ->where('time', $booking->time)
                ->where('status', 'pending')
                ->where('id', '!=', $booking->id)
                ->update(['status' => 'cancelled']);

            $newStatus = 'confirmed';
        }

        $booking->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status updated to ' . $newStatus,
            'booking' => $this->formatBooking($booking->fresh()),
        ]);
    }

    public function submitFeedback(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|in:parent,teacher',
            'answers' => 'required|array',
        ]);

        $booking = Booking::findOrFail($id);
        $feedback = $booking->feedback ?? [];
        $feedback[$request->role] = [
            'answers' => $request->answers,
            'submittedAt' => now()->toDateTimeString(),
        ];
        $booking->update(['feedback' => $feedback]);

        // Update teacher rating when parent submits feedback
        if ($request->role === 'parent') {
            $rating = $this->computeRatingFromAnswers($request->answers);

            // Create a review record
            Review::create([
                'teacher_id' => $booking->teacher_id,
                'parent_id' => $booking->parent_id,
                'rating' => (int) round($rating),
                'comment' => '',
                'recommend' => $rating >= 3,
                'book_again' => $rating >= 3,
            ]);

            // Recompute teacher rating from all reviews
            $avg = Review::where('teacher_id', $booking->teacher_id)->avg('rating');
            $teacher = $booking->teacher;
            $detail = $teacher->teacherDetail;
            if ($detail) {
                $detail->update([
                    'rating' => round($avg ?? 0, 1),
                ]);
            }

            // Update child progress from parent's Child Progress answers (questions 1-5)
            $childProgressAnswers = array_filter($request->answers, fn ($a) => $a['questionId'] <= 5);
            if (!empty($childProgressAnswers)) {
                $avg = array_sum(array_column($childProgressAnswers, 'answer')) / count($childProgressAnswers);
                $pct = round(($avg / 5) * 100);
                Progress::updateOrCreate(
                    ['child_id' => $booking->child_id, 'subject' => $booking->session_type],
                    [
                        'overall_progress' => $pct,
                        'scores' => Progress::where('child_id', $booking->child_id)
                            ->where('subject', $booking->session_type)
                            ->value('scores') ?? [],
                    ]
                );
                // Append new score entry
                $progress = Progress::where('child_id', $booking->child_id)
                    ->where('subject', $booking->session_type)->first();
                if ($progress) {
                    $scores = $progress->scores ?? [];
                    $scores[] = ['date' => now()->toDateString(), 'score' => $pct];
                    $progress->update(['scores' => $scores, 'overall_progress' => $pct]);
                }
            }
        }

        // Teacher feedback updates subject progress (questions 13-22)
        if ($request->role === 'teacher') {
            $learningAnswers = array_filter($request->answers, fn ($a) => $a['questionId'] >= 18 && $a['questionId'] <= 22);
            $engagementAnswers = array_filter($request->answers, fn ($a) => $a['questionId'] >= 13 && $a['questionId'] <= 17);
            if (!empty($learningAnswers) || !empty($engagementAnswers)) {
                $allScores = array_merge(
                    array_column($learningAnswers, 'answer'),
                    array_column($engagementAnswers, 'answer')
                );
                $avg = !empty($allScores) ? array_sum($allScores) / count($allScores) : 3;
                $pct = round(($avg / 5) * 100);
                $progress = Progress::where('child_id', $booking->child_id)
                    ->where('subject', $booking->session_type)->first();
                $scores = $progress?->scores ?? [];
                $scores[] = ['date' => now()->toDateString(), 'score' => $pct];
                Progress::updateOrCreate(
                    ['child_id' => $booking->child_id, 'subject' => $booking->session_type],
                    ['overall_progress' => $pct, 'scores' => $scores]
                );
            }
        }

        return response()->json(['message' => 'Feedback submitted', 'feedback' => $feedback]);
    }

    private function computeRatingFromAnswers(array $answers): float
    {
        $values = array_column($answers, 'answer');
        return count($values) > 0 ? array_sum($values) / count($values) : 3;
    }

    public function destroy(int $id): JsonResponse
    {
        Booking::findOrFail($id)->delete();
        return response()->json(['message' => 'Booking cancelled']);
    }

    private function formatBooking($b): array
    {
        return [
            'id' => (string) $b->id,
            'parentId' => (string) $b->parent_id,
            'teacherId' => (string) $b->teacher_id,
            'childId' => (string) $b->child_id,
            'childName' => $b->child?->name ?? 'Unknown',
            'parentName' => $b->parent?->name ?? 'Unknown',
            'date' => $b->date,
            'time' => $b->time,
            'duration' => $b->duration,
            'status' => $b->status,
            'totalAmount' => (float) $b->total_amount,
            'sessionType' => $b->session_type,
            'sessionMode' => $b->session_mode ?? 'online',
            'address' => $b->address,
            'notes' => $b->notes,
            'feedback' => $b->feedback,
            'createdAt' => $b->created_at,
        ];
    }
}
