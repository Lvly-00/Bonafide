<?php

namespace App\Http\Controllers\Api;

use App\Models\Assessment;
use App\Models\Booking;
use App\Models\Child;
use App\Models\Progress;
use App\Models\User;
use App\Services\GroqService;
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
        $childConcerns = array_map('strtolower', $child->learning_concerns ?? []);
        $childStrengths = array_map('strtolower', $child->strengths ?? []);
        $teachers = User::where('role', 'teacher')
            ->with('teacherDetail')
            ->get()
            ->filter(function ($teacher) use ($interests) {
                $detail = $teacher->teacherDetail;
                if (!$detail) return false;

                $subjects = array_map('strtolower', $detail->subjects ?? []);
                $availability = $detail->availability ?? [];

                $score = 0;
                if (!empty($interests) && !empty($subjects)) {
                    $matches = array_intersect($interests, $subjects);
                    $score += min(50, count($matches) * 15);
                }
                if (!empty($subjects)) $score += 10;
                if (!empty($availability)) $score += 10;

                return $score > 0;
            })
            ->values();

        if ($teachers->isEmpty()) {
            return response()->json([]);
        }

        $childInfo = $child->toArray();
        $teachersData = $teachers->map(fn ($t) => [
            'name' => $t->name,
            'subjects' => $t->teacherDetail->subjects ?? [],
            'bio' => $t->teacherDetail->bio ?? '',
            'experience' => $t->teacherDetail->experience ?? 0,
            'education' => $t->teacherDetail->education ?? '',
            'rating' => $t->teacherDetail->rating ?? 0,
            'learning_concerns' => $t->teacherDetail->learning_concerns ?? [],
            'strengths_support' => $t->teacherDetail->strengths_support ?? [],
        ])->toArray();

        $groq = app(GroqService::class);
        $aiMatches = $groq->matchTeachers($childInfo, $teachersData);

        $aiByIndex = [];
        if (is_array($aiMatches)) {
            foreach ($aiMatches as $m) {
                if (isset($m['teacherIndex'])) {
                    $aiByIndex[$m['teacherIndex']] = $m;
                }
            }
        }

        $result = $teachers->map(function ($teacher, $idx) use ($interests, $childConcerns, $childStrengths, $aiByIndex) {
            $detail = $teacher->teacherDetail;
            $subjects = array_map('strtolower', $detail->subjects ?? []);
            $availability = $detail->availability ?? [];
            $teacherConcerns = array_map('strtolower', $detail->learning_concerns ?? []);
            $teacherStrengths = array_map('strtolower', $detail->strengths_support ?? []);

            $score = 0;
            $reasons = [];

            if (!empty($interests) && !empty($subjects)) {
                $matches = array_intersect($interests, $subjects);
                $score += min(50, count($matches) * 15);
                if (!empty($matches)) {
                    $reasons[] = 'Teaches subjects your child is interested in';
                }
            }

            if (!empty($childConcerns) && !empty($teacherConcerns)) {
                $concernMatches = array_intersect($childConcerns, $teacherConcerns);
                $score += min(30, count($concernMatches) * 15);
                if (!empty($concernMatches)) {
                    $reasons[] = 'Specializes in your child\'s learning needs';
                }
            }

            if (!empty($childStrengths) && !empty($teacherStrengths)) {
                $strengthMatches = array_intersect($childStrengths, $teacherStrengths);
                $score += min(20, count($strengthMatches) * 10);
                if (!empty($strengthMatches)) {
                    $reasons[] = 'Can nurture your child\'s strengths';
                }
            }

            if (!empty($subjects)) $score += 10;
            if (!empty($availability)) $score += 10;

            $ai = $aiByIndex[$idx] ?? null;
            if ($ai) {
                $compatibilityScore = (int) ($ai['compatibilityScore'] ?? $score);
                $aiReasons = $ai['matchReasons'] ?? [];
                $reasons = array_merge($reasons, $aiReasons);
            } else {
                $compatibilityScore = min(100, $score);
            }

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
                'compatibilityScore' => min(100, $compatibilityScore),
                'matchReasons' => array_slice($reasons, 0, 3),
            ];
        })
            ->sortByDesc('compatibilityScore')
            ->values();

        return response()->json($result);
    }

    public function learningProfile(int $id): JsonResponse
    {
        $child = Child::findOrFail($id);

        $assessment = Assessment::where('child_id', $id)->first();
        $progressRecords = Progress::where('child_id', $id)->get();
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

        $subjects = $progressRecords->map(fn ($p) => [
            'name' => $p->subject,
            'progress' => $p->overall_progress,
            'scores' => $p->scores ?? [],
        ])->toArray();

        $groq = app(GroqService::class);
        $aiProgress = $groq->analyzeProgress(
            $child->toArray(),
            $subjects,
            $feedbackHistory->toArray()
        );

        if (!empty($aiProgress)) {
            if (isset($aiProgress['learningTrends'])) {
                $profile['learningTrends'] = $aiProgress['learningTrends'];
            }
            if (isset($aiProgress['updatedProfile'])) {
                $profile['updatedProfile'] = $aiProgress['updatedProfile'];
            }
            if (isset($aiProgress['recommendations'])) {
                $profile['recommendations'] = $aiProgress['recommendations'];
            }
            if (isset($aiProgress['strengthsEmerging'])) {
                $profile['strengthsEmerging'] = $aiProgress['strengthsEmerging'];
            }
            if (isset($aiProgress['areasNeedingAttention'])) {
                $profile['areasNeedingAttention'] = $aiProgress['areasNeedingAttention'];
            }
        }

        return response()->json([
            'childId' => (string) $child->id,
            'childName' => $child->name,
            'profile' => $profile,
            'subjects' => $subjects,
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

            'profileCompleted' => (bool) $child->profile_completed,
            'teacherId' => $child->teacher_id ? (string) $child->teacher_id : null,
        ];
    }
}
