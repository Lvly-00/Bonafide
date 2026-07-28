<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Child;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, string $role): JsonResponse
    {
        $userId = $request->user()->id;

        if ($role === 'parent') {
            $children = Child::where('parent_id', $userId)->get();
            $bookings = Booking::where('parent_id', $userId)->with('child', 'teacher')->get();

            $totalSessions = $bookings->count();
            $completedSessions = $bookings->where('status', 'completed')->count();
            $upcomingSessionsCount = $bookings->whereIn('status', ['confirmed', 'scheduled'])->count();

            $upcomingSessions = $bookings
                ->whereIn('status', ['confirmed', 'scheduled'])
                ->take(5)
                ->values()
                ->map(fn ($b) => [
                    'id' => (string) $b->id,
                    'childName' => $b->child?->name ?? 'Unknown',
                    'teacherName' => $b->teacher?->name ?? 'Unknown',
                    'subject' => $b->session_type,
                    'date' => $b->date,
                    'time' => $b->time,
                    'status' => $b->status,
                ]);

            $recentActivity = collect();
            foreach ($bookings->sortByDesc('created_at')->take(5) as $b) {
                $recentActivity->push([
                    'id' => 'booking-' . $b->id,
                    'type' => $b->status === 'completed' ? 'session_completed' : 'booking_confirmed',
                    'message' => $b->status === 'completed'
                        ? "Session with {$b->teacher?->name} completed"
                        : "Session booked with {$b->teacher?->name}",
                    'time' => $b->created_at?->diffForHumans() ?? 'recent',
                ]);
            }

            $childrenProgress = $children->map(fn ($c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'grade' => $c->grade,
                'progress' => $c->bookingProgress(),
                'sessionsThisMonth' => $bookings->where('child_id', $c->id)->count(),
                'teacherName' => $c->teacher?->name ?? 'Not assigned',
            ]);

            return response()->json([
                'stats' => [
                    'totalSessions' => $totalSessions,
                    'completedSessions' => $completedSessions,
                    'upcomingSessions' => $upcomingSessionsCount,
                    'averageRating' => 4.5,
                ],
                'upcomingSessions' => $upcomingSessions,
                'recentActivity' => $recentActivity,
                'childrenProgress' => $childrenProgress,
            ]);
        }

        if ($role === 'teacher') {
            $bookings = Booking::where('teacher_id', $userId)->with('child', 'parent')->get();
            $today = now()->toDateString();

            $stats = [
                'totalStudents' => $bookings->pluck('child_id')->unique()->count(),
                'totalSessions' => $bookings->count(),
                'completedThisMonth' => $bookings->where('status', 'completed')
                    ->filter(fn ($b) => $b->created_at?->isCurrentMonth())->count(),
                'upcomingSessions' => $bookings->whereIn('status', ['confirmed', 'scheduled'])->count(),
                'averageRating' => 4.5,
            ];

            $todaySessions = $bookings
                ->where('date', $today)
                ->take(10)
                ->values()
                ->map(fn ($b) => [
                    'id' => (string) $b->id,
                    'studentName' => $b->child?->name ?? 'Unknown',
                    'subject' => $b->session_type,
                    'duration' => $b->duration,
                    'time' => $b->time,
                    'status' => $b->status,
                ]);

            $recentStudents = $bookings
                ->sortByDesc('created_at')
                ->unique('child_id')
                ->take(5)
                ->values()
                ->map(function ($b) use ($bookings) {
                    $childBks = $bookings->where('child_id', $b->child_id);
                    $total = $childBks->whereIn('status', ['confirmed', 'completed'])->count();
                    $completed = $childBks->where('status', 'completed')->count();
                    $progress = $total > 0 ? (int) round(($completed / $total) * 100) : 0;
                    return [
                        'id' => (string) $b->child_id,
                        'name' => $b->child?->name ?? 'Unknown',
                        'subject' => $b->session_type,
                        'progress' => $progress,
                        'lastSession' => $b->date,
                    ];
                });

            $upcomingBookings = $bookings->whereIn('status', ['confirmed', 'scheduled']);
            $weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            $upcomingWeek = collect($weekDays)->map(fn ($day) => [
                'day' => $day,
                'sessions' => $upcomingBookings->filter(fn ($b) => date('l', strtotime($b->date)) === $day)
                    ->take(3)
                    ->values()
                    ->map(fn ($b) => [
                        'time' => $b->time,
                        'student' => $b->child?->name ?? 'Unknown',
                    ]),
            ]);

            return response()->json([
                'stats' => $stats,
                'todaySessions' => $todaySessions,
                'recentStudents' => $recentStudents,
                'upcomingWeek' => $upcomingWeek,
            ]);
        }

        if ($role === 'admin') {
            $totalUsers = User::count();
            $totalTeachers = User::where('role', 'teacher')->count();
            $totalParents = User::where('role', 'parent')->count();
            $totalBookings = Booking::count();
            $totalRevenue = Booking::where('status', 'completed')->sum('total_amount');

            return response()->json([
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'totalTeachers' => $totalTeachers,
                    'totalParents' => $totalParents,
                    'totalBookings' => $totalBookings,
                    'totalRevenue' => (float) $totalRevenue,
                    'activeUsers' => $totalUsers,
                ],
                'recentActivities' => [],
                'verificationQueue' => [],
                'monthlyBookings' => [],
                'revenueData' => [],
            ]);
        }

        return response()->json([
            'stats' => [],
            'recentActivity' => [],
            'upcomingSessions' => [],
            'childrenProgress' => [],
        ]);
    }
}
