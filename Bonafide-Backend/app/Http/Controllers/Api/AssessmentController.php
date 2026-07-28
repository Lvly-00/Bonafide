<?php

namespace App\Http\Controllers\Api;

use App\Models\Assessment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends ApiController
{
    public function show(int $childId): JsonResponse
    {
        $assessment = Assessment::where('child_id', $childId)->first();
        if (!$assessment) {
            return response()->json(null);
        }
        return response()->json([
            'id' => (string) $assessment->id,
            'childId' => (string) $assessment->child_id,
            'status' => $assessment->status,
            'answers' => $assessment->answers ?? [],
            'result' => $assessment->result,
            'progress' => $assessment->progress,
            'startedAt' => $assessment->started_at,
            'completedAt' => $assessment->completed_at,
        ]);
    }

    public function questions(): JsonResponse
    {
        $questions = [
            ['id' => 1, 'question' => 'How do you prefer to learn new things?', 'type' => 'choice', 'options' => ['Reading', 'Listening', 'Doing', 'Watching']],
            ['id' => 2, 'question' => 'When solving a problem, you usually:', 'type' => 'choice', 'options' => ['Think step by step', 'Try different approaches', 'Ask for help', 'Use intuition']],
            ['id' => 3, 'question' => 'What is your favorite subject?', 'type' => 'choice', 'options' => ['Math', 'Science', 'Art', 'Language']],
        ];
        return response()->json($questions);
    }

    public function submit(Request $request, int $childId): JsonResponse
    {
        $request->validate(['answers' => 'required|array']);

        $assessment = Assessment::updateOrCreate(
            ['child_id' => $childId],
            [
                'answers' => $request->answers,
                'status' => 'completed',
                'progress' => 100,
                'completed_at' => now(),
                'result' => [
                    'learningProfile' => ['type' => 'Kinesthetic Learner', 'description' => 'Hands-on learning style detected.'],
                    'strengths' => ['Problem Solving', 'Creativity'],
                    'weaknesses' => ['Reading Comprehension'],
                    'recommendations' => ['Use hands-on materials', 'Take movement breaks'],
                    'recommendedTeachers' => [],
                    'scores' => [
                        ['category' => 'Logical Reasoning', 'score' => 85],
                        ['category' => 'Reading Comprehension', 'score' => 55],
                        ['category' => 'Creativity', 'score' => 90],
                        ['category' => 'Problem Solving', 'score' => 88],
                    ],
                ],
            ]
        );

        return response()->json([
            'id' => (string) $assessment->id,
            'childId' => (string) $assessment->child_id,
            'status' => $assessment->status,
            'answers' => $assessment->answers ?? [],
            'result' => $assessment->result,
            'progress' => $assessment->progress,
            'startedAt' => $assessment->started_at,
            'completedAt' => $assessment->completed_at,
        ]);
    }

    public function saveProgress(Request $request, int $childId): JsonResponse
    {
        $request->validate([
            'answers' => 'required|array',
            'progress' => 'required|integer',
        ]);

        Assessment::updateOrCreate(
            ['child_id' => $childId],
            [
                'answers' => $request->answers,
                'progress' => $request->progress,
                'started_at' => now(),
            ]
        );

        return response()->json(['message' => 'Progress saved']);
    }
}
