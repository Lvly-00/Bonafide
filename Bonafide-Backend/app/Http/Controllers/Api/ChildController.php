<?php

namespace App\Http\Controllers\Api;

use App\Models\Assessment;
use App\Models\Booking;
use App\Models\Child;
use App\Models\Progress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChildController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $children = Child::where('parent_id', $request->user()->id)->get();
        return response()->json($children->map(fn ($c) => $this->formatChild($c)));
    }

    public function show(int $id): JsonResponse
    {
        $child = Child::findOrFail($id);
        return response()->json($this->formatChild($child));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'age' => 'required|integer',
            'grade' => 'required|string',
        ]);

        $data = $this->mapInput($request, [
            'name' => 'name',
            'age' => 'age',
            'grade' => 'grade',
            'avatar' => 'avatar',
            'interests' => 'interests',
            'learningConcerns' => 'learning_concerns',
            'learningStyle' => 'learning_style',
            'strengths' => 'strengths',
            'schedule' => 'schedule',
            'profileCompleted' => 'profile_completed',
            'teacherId' => 'teacher_id',
            'learning_concerns' => 'learning_concerns',
            'learning_style' => 'learning_style',
            'profile_completed' => 'profile_completed',
            'teacher_id' => 'teacher_id',
        ]);

        $data['parent_id'] = $request->user()->id;

        $child = Child::create($data);
        return response()->json($this->formatChild($child), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $child = Child::findOrFail($id);

        $data = $this->mapInput($request, [
            'name' => 'name',
            'age' => 'age',
            'grade' => 'grade',
            'avatar' => 'avatar',
            'interests' => 'interests',
            'learningConcerns' => 'learning_concerns',
            'learningStyle' => 'learning_style',
            'strengths' => 'strengths',
            'schedule' => 'schedule',
            'profileCompleted' => 'profile_completed',
            'teacherId' => 'teacher_id',
            'learning_concerns' => 'learning_concerns',
            'learning_style' => 'learning_style',
            'profile_completed' => 'profile_completed',
            'teacher_id' => 'teacher_id',
        ]);

        $child->update($data);
        return response()->json($this->formatChild($child));
    }

    public function destroy(int $id): JsonResponse
    {
        Child::findOrFail($id)->delete();
        return response()->json(['message' => 'Child deleted']);
    }

    public function recommendedTeachers(int $id): JsonResponse
    {
        $child = Child::findOrFail($id);
        $interests = array_map('strtolower', $child->interests ?? []);
        $childSchedule = $child->schedule ?? [];

        $teachers = User::where('role', 'teacher')
            ->with('teacherDetail')
            ->get()
            ->filter(function ($teacher) use ($interests, $childSchedule) {
                $detail = $teacher->teacherDetail;
                if (!$detail) return false;

                $subjects = array_map('strtolower', $detail->subjects ?? []);
                $availability = $detail->availability ?? [];

                // Score: 0-100
                $score = 0;

                // Subject match (up to 50 points)
                if (!empty($interests) && !empty($subjects)) {
                    $matches = array_intersect($interests, $subjects);
                    $score += min(50, count($matches) * 15);
                }

                // Schedule overlap (up to 30 points)
                if (!empty($childSchedule) && !empty($availability)) {
                    foreach ($childSchedule as $cs) {
                        foreach ($availability as $avail) {
                            if (strtolower($cs['day']) === strtolower($avail['day'])) {
                                $score += 10;
                                break 2;
                            }
                        }
                    }
                }

                // Has any subjects/availability (up to 20 points)
                if (!empty($subjects)) $score += 10;
                if (!empty($availability)) $score += 10;

                return $score > 0;
            })
            ->values()
            ->map(function ($teacher) use ($interests, $childSchedule) {
                $detail = $teacher->teacherDetail;
                $subjects = array_map('strtolower', $detail->subjects ?? []);
                $availability = $detail->availability ?? [];

                $score = 0;
                $reasons = [];

                if (!empty($interests) && !empty($subjects)) {
                    $matches = array_intersect($interests, $subjects);
                    $score += min(50, count($matches) * 15);
                    if (!empty($matches)) {
                        $reasons[] = 'Teaches subjects your child is interested in';
                    }
                }

                if (!empty($childSchedule) && !empty($availability)) {
                    foreach ($childSchedule as $cs) {
                        foreach ($availability as $avail) {
                            if (strtolower($cs['day']) === strtolower($avail['day'])) {
                                $score += 10;
                                $reasons[] = 'Available on ' . $cs['day'];
                                break 2;
                            }
                        }
                    }
                }

                if (!empty($subjects)) $score += 10;
                if (!empty($availability)) $score += 10;

                return [
                    'teacherId' => (string) $teacher->id,
                    'name' => $teacher->name,
                    'avatar' => $teacher->avatar,
                    'subjects' => $detail->subjects ?? [],
                    'rating' => (float) ($detail->rating ?? 0),
                    'hourlyRate' => (float) ($detail->hourly_rate ?? 0),
                    'experience' => (int) ($detail->experience ?? 0),
                    'education' => $detail->education ?? '',
                    'bio' => $detail->bio ?? '',
                    'compatibilityScore' => min(100, $score),
                    'matchReasons' => array_slice($reasons, 0, 3),
                ];
            })
            ->sortByDesc('compatibilityScore')
            ->values();

        return response()->json($teachers);
    }

    public function learningProfile(int $id): JsonResponse
    {
        $child = Child::findOrFail($id);

        // Initial AI assessment
        $assessment = Assessment::where('child_id', $id)->first();

        // Progress records per subject
        $progressRecords = Progress::where('child_id', $id)->get();

        // Feedback history from completed bookings
        $completedBookings = Booking::where('child_id', $id)
            ->where('status', 'completed')
            ->whereNotNull('feedback')
            ->with('teacher')
            ->get();

        $feedbackHistory = $completedBookings->map(fn ($b) => [
            'date' => $b->date,
            'teacherName' => $b->teacher?->name ?? 'Unknown',
            'subject' => $b->session_type,
            'feedback' => $b->feedback,
        ]);

        // Compute current learning profile from latest assessment + feedback
        $profile = [
            'learningStyle' => $child->learning_style ?? '',
            'interests' => $child->interests ?? [],
            'strengths' => $child->strengths ?? [],
        ];

        if ($assessment?->result) {
            $profile = array_merge($profile, [
                'learningProfileType' => $assessment->result['learningProfile']['type'] ?? '',
                'learningProfileDescription' => $assessment->result['learningProfile']['description'] ?? '',
                'initialScores' => $assessment->result['scores'] ?? [],
                'initialStrengths' => $assessment->result['strengths'] ?? [],
                'initialWeaknesses' => $assessment->result['weaknesses'] ?? [],
                'recommendations' => $assessment->result['recommendations'] ?? [],
            ]);
        }

        return response()->json([
            'childId' => (string) $child->id,
            'childName' => $child->name,
            'profile' => $profile,
            'subjects' => $progressRecords->map(fn ($p) => [
                'name' => $p->subject,
                'progress' => $p->overall_progress,
                'scores' => $p->scores ?? [],
            ]),
            'feedbackHistory' => $feedbackHistory,
        ]);
    }

    private function formatChild($child): array
    {
        return [
            'id' => (string) $child->id,
            'parentId' => (string) $child->parent_id,
            'name' => $child->name,
            'age' => $child->age,
            'grade' => $child->grade,
            'avatar' => $child->avatar,
            'learningConcerns' => $child->learning_concerns ?? [],
            'strengths' => $child->strengths ?? [],
            'learningStyle' => $child->learning_style ?? '',
            'interests' => $child->interests ?? [],
            'schedule' => $child->schedule ?? [],
            'profileCompleted' => (bool) $child->profile_completed,
            'teacherId' => $child->teacher_id ? (string) $child->teacher_id : null,
        ];
    }
}
