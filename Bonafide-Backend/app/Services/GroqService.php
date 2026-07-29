<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    private ?string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key');
        $this->baseUrl = config('services.groq.base_url');
        $this->model = config('services.groq.model');
    }

    public function analyzeAssessment(array $answers, array $childInfo): array
    {
        $answersText = collect($answers)->map(fn ($a, $i) =>
            "Q" . ($i + 1) . ": " . ($a['question'] ?? '') . " -> Answer: " . ($a['answer'] ?? '')
        )->implode("\n");

        $interests = implode(', ', $childInfo['interests'] ?? []);
        $concerns = implode(', ', $childInfo['learning_concerns'] ?? []);

        $prompt = "You are an AI educational assessment analyst. Analyze the following child's assessment answers and profile information.\n\n"
            . "Child Profile:\n"
            . "- Name: {$childInfo['name']}\n"
            . "- Age: {$childInfo['age']}\n"
            . "- Grade: {$childInfo['grade']}\n"
            . "- Interests: {$interests}\n"
            . "- Learning Concerns: {$concerns}\n\n"
            . "Assessment Answers:\n{$answersText}\n\n"
            . "Return a JSON object (no markdown, no code fences) with this exact structure:\n"
            . "{\n"
            . '  "learningProfile": {"type": "One of: Visual Learner, Auditory Learner, Kinesthetic Learner, Reading/Writing Learner, Multimodal Learner", "description": "A 1-2 sentence description of this learning style"},'
            . "\n"
            . '  "strengths": ["Array of 2-4 key strengths"],'
            . "\n"
            . '  "weaknesses": ["Array of 2-4 areas for improvement"],'
            . "\n"
            . '  "recommendations": ["Array of 3-5 actionable recommendations for parents and teachers"],'
            . "\n"
            . '  "scores": ['
            . "\n"
            . '    {"category": "Logical Reasoning", "score": <0-100>},'
            . "\n"
            . '    {"category": "Reading Comprehension", "score": <0-100>},'
            . "\n"
            . '    {"category": "Creativity", "score": <0-100>},'
            . "\n"
            . '    {"category": "Problem Solving", "score": <0-100>},'
            . "\n"
            . '    {"category": "Memory", "score": <0-100>},'
            . "\n"
            . '    {"category": "Attention", "score": <0-100>}'
            . "\n"
            . "  ]\n"
            . "}";

        return $this->chat($prompt);
    }

    public function matchTeachers(array $childInfo, array $teachers): array
    {
        $interests = implode(', ', $childInfo['interests'] ?? []);
        $strengths = implode(', ', $childInfo['strengths'] ?? []);
        $concerns = implode(', ', $childInfo['learning_concerns'] ?? []);

        $teachersText = collect($teachers)->map(fn ($t) =>
            "- Teacher: {$t['name']}, Subjects: " . implode(', ', $t['subjects'] ?? [])
            . ", Learning Concerns Expertise: " . implode(', ', $t['learning_concerns'] ?? [])
            . ", Strengths Support: " . implode(', ', $t['strengths_support'] ?? [])
            . ", Bio: {$t['bio']}, Experience: {$t['experience']} years, Education: {$t['education']}, Rating: {$t['rating']}"
        )->implode("\n");

        $prompt = "You are an AI teacher matching specialist. Analyze the compatibility between a child and available teachers.\n\n"
            . "Child Profile:\n"
            . "- Name: {$childInfo['name']}\n"
            . "- Age: {$childInfo['age']}\n"
            . "- Grade: {$childInfo['grade']}\n"
            . "- Interests: {$interests}\n"
            . "- Strengths: {$strengths}\n"
            . "- Learning Style: {$childInfo['learning_style']}\n"
            . "- Learning Concerns: {$concerns}\n\n"
            . "Available Teachers:\n{$teachersText}\n\n"
            . "For EACH teacher, evaluate compatibility and return a JSON array (no markdown, no code fences) with this exact structure:\n"
            . "[\n"
            . "  {\n"
            . '    "teacherIndex": <0-based index of the teacher in the list>,'
            . "\n"
            . '    "compatibilityScore": <0-100 integer>,'
            . "\n"
            . '    "matchReasons": ["Array of 2-3 specific, personalized reasons why this teacher is a good match for THIS child"],'
            . "\n"
            . '    "suggestedFocus": "A brief suggestion for what this teacher should focus on with this child"'
            . "\n"
            . "  }\n"
            . "]\n\n"
            . "Consider: subject alignment, teaching style compatibility, experience with the child's learning concerns, ability to nurture the child's strengths, experience with the child's age group, and personality fit. Be honest - low compatibility scores are fine if there's a genuine mismatch.";

        return $this->chat($prompt);
    }

    public function analyzeProgress(array $childInfo, array $subjects, array $feedbackHistory): array
    {
        $interests = implode(', ', $childInfo['interests'] ?? []);
        $strengths = implode(', ', $childInfo['strengths'] ?? []);

        $subjectsText = collect($subjects)->map(fn ($s) =>
            "- {$s['name']}: overall progress {$s['progress']}%"
        )->implode("\n");

        $feedbackText = collect($feedbackHistory)->map(fn ($f) =>
            "- {$f['date']}: {$f['teacherName']} ({$f['subject']}) - {$f['feedback']}"
        )->implode("\n");

        $prompt = "You are an AI learning progress analyst. Analyze the following child's learning data and generate insights.\n\n"
            . "Child Profile:\n"
            . "- Name: {$childInfo['name']}\n"
            . "- Age: {$childInfo['age']}\n"
            . "- Grade: {$childInfo['grade']}\n"
            . "- Interests: {$interests}\n"
            . "- Strengths: {$strengths}\n"
            . "- Learning Style: {$childInfo['learning_style']}\n\n"
            . "Subject Progress:\n{$subjectsText}\n\n"
            . "Recent Teacher Feedback:\n{$feedbackText}\n\n"
            . "Return a JSON object (no markdown, no code fences) with this exact structure:\n"
            . "{\n"
            . '  "learningTrends": "A 2-3 sentence analysis of the child\'s learning trends and progress trajectory",'
            . "\n"
            . '  "updatedProfile": {"type": "The child\'s dominant learning style based on evidence", "description": "Updated description"},'
            . "\n"
            . '  "recommendations": ["Array of 3-5 specific recommendations for next steps"],'
            . "\n"
            . '  "strengthsEmerging": ["Array of newly emerging strengths"],'
            . "\n"
            . '  "areasNeedingAttention": ["Array of areas that need more focus"]'
            . "\n"
            . "}";

        return $this->chat($prompt);
    }

    public function generateSuggestions(array $context): array
    {
        $prompt = "You are an AI teaching assistant. Based on the following session context, generate 3-5 specific, actionable suggestions for the teacher.\n\n"
            . "Context:\n"
            . "- Student Progress: {$context['studentProgress']}\n"
            . "- Goals: {$context['goals']}\n"
            . "- Mood: {$context['mood']}\n"
            . "- Notes: {$context['notes']}\n"
            . "- Subject: {$context['subject']}\n\n"
            . "Return a JSON object (no markdown, no code fences) with this exact structure:\n"
            . "{\n"
            . '  "suggestions": ["Array of 3-5 specific, actionable teaching suggestions"]'
            . "\n"
            . "}";

        return $this->chat($prompt);
    }

    private function chat(string $prompt): array
    {
        if (empty($this->apiKey)) {
            Log::warning('GROQ_API_KEY is not set, returning fallback data');
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful AI assistant. Always respond with valid JSON only, no markdown formatting, no code fences, no explanation.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.3,
                'max_tokens' => 2000,
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $content = trim($content);
                $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content);
                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }
                Log::warning('Groq response was not valid JSON', ['content' => $content]);
            } else {
                Log::error('Groq API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Groq API request failed', ['message' => $e->getMessage()]);
        }

        return [];
    }
}
