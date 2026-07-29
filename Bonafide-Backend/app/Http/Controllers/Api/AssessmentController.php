<?php

namespace App\Http\Controllers\Api;

use App\Models\Assessment;
use App\Models\Child;
use App\Services\GroqService;
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
        return response()->json($this->questionsData());
    }

    private function questionsData(): array
    {
        return [
            ['id' => 1, 'question' => 'How do you prefer to learn new things?', 'type' => 'choice', 'options' => ['Reading', 'Listening', 'Doing', 'Watching']],
            ['id' => 2, 'question' => 'When solving a problem, you usually:', 'type' => 'choice', 'options' => ['Think step by step', 'Try different approaches', 'Ask for help', 'Use intuition']],
            ['id' => 3, 'question' => 'What is your favorite subject?', 'type' => 'choice', 'options' => ['Math', 'Science', 'Art', 'Language']],
            ['id' => 4, 'question' => 'How well do you focus on tasks?', 'type' => 'choice', 'options' => ['Very focused', 'Moderately focused', 'Easily distracted', 'Depends on interest']],
            ['id' => 5, 'question' => 'When learning something new, you prefer:', 'type' => 'choice', 'options' => ['Step-by-step instructions', 'Exploring on your own', 'Working with others', 'Watching demonstrations']],
            ['id' => 6, 'question' => 'How do you handle challenging problems?', 'type' => 'choice', 'options' => ['Persist until solved', 'Ask for hints', 'Take a break and return', 'Skip and try later']],
            ['id' => 7, 'question' => 'What type of activities help you learn best?', 'type' => 'choice', 'options' => ['Reading and writing', 'Hands-on projects', 'Group discussions', 'Visual aids and videos']],
            ['id' => 8, 'question' => 'How would you describe your memory?', 'type' => 'choice', 'options' => ['Excellent with details', 'Good with concepts', 'Need repetition', 'Visual memory is strong']],
            ['id' => 9, 'question' => 'When reading, you usually:', 'type' => 'choice', 'options' => ['Read quickly and understand well', 'Read slowly and carefully', 'Prefer being read to', 'Struggle with comprehension']],
            ['id' => 10, 'question' => 'How do you express creativity?', 'type' => 'choice', 'options' => ['Writing and storytelling', 'Art and drawing', 'Building and making', 'Music and performance']],
        ];
    }

    public function submit(Request $request, int $childId): JsonResponse
    {
        $request->validate(['answers' => 'required|array']);

        $child = Child::find($childId);

        // Map questionIds to question text
        $questions = $this->questionsData();
        $answersWithText = collect($request->answers)->map(function ($a) use ($questions) {
            $q = collect($questions)->firstWhere('id', $a['questionId'] ?? $a['question_id']);
            return [
                'question' => $q['question'] ?? "Question {$a['questionId']}",
                'answer' => $a['answer'] ?? '',
            ];
        })->toArray();

        $groq = app(GroqService::class);
        $groqResult = $groq->analyzeAssessment(
            $answersWithText,
            $child ? $child->toArray() : ['name' => 'Student', 'age' => '', 'grade' => '', 'interests' => [], 'learning_concerns' => []]
        );

        $defaultResult = [
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
        ];

        $result = $groqResult ?: $defaultResult;
        $result['recommendedTeachers'] = [];

        $assessment = Assessment::updateOrCreate(
            ['child_id' => $childId],
            [
                'answers' => $request->answers,
                'status' => 'completed',
                'progress' => 100,
                'completed_at' => now(),
                'result' => $result,
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
