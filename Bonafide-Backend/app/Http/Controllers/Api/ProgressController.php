<?php

namespace App\Http\Controllers\Api;

use App\Models\Progress;
use Illuminate\Http\JsonResponse;

class ProgressController extends ApiController
{
    public function index(int $childId): JsonResponse
    {
        $progress = Progress::where('child_id', $childId)->get();
        return response()->json($progress->map(fn ($p) => [
            'childId' => (string) $p->child_id,
            'subject' => $p->subject,
            'scores' => $p->scores ?? [],
            'achievements' => $p->achievements ?? [],
            'overallProgress' => $p->overall_progress,
        ]));
    }

    public function passport(int $childId): JsonResponse
    {
        $allProgress = Progress::where('child_id', $childId)->get();
        $subjects = $allProgress->map(fn ($p) => [
            'name' => $p->subject,
            'level' => $p->overall_progress >= 80 ? 'Advanced' : ($p->overall_progress >= 50 ? 'Intermediate' : 'Beginner'),
            'progress' => $p->overall_progress,
            'topics' => [],
        ]);

        $achievements = $allProgress->pluck('achievements')->flatten(1)->unique('id')->values();
        $overallProgress = $allProgress->avg('overall_progress') ?? 0;

        return response()->json([
            'childId' => (string) $childId,
            'subjects' => $subjects,
            'badges' => $achievements,
            'overallProgress' => (int) $overallProgress,
            'strengths' => [],
            'areasForImprovement' => [],
        ]);
    }
}
