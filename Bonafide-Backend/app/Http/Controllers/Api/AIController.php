<?php

namespace App\Http\Controllers\Api;

use App\Services\GroqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends ApiController
{
    public function suggestions(Request $request): JsonResponse
    {
        $request->validate([
            'studentProgress' => 'required|string',
            'goals' => 'required|string',
            'mood' => 'required|string',
            'notes' => 'required|string',
            'subject' => 'required|string',
        ]);

        $groq = app(GroqService::class);
        $result = $groq->generateSuggestions($request->only([
            'studentProgress', 'goals', 'mood', 'notes', 'subject',
        ]));

        if (!empty($result) && isset($result['suggestions'])) {
            return response()->json($result);
        }

        return response()->json([
            'suggestions' => [
                'Try using music-based learning to improve retention',
                'Incorporate more visual aids for complex concepts',
                'Consider short breaks every 20 minutes to maintain focus',
                'Use real-world examples to make abstract concepts more relatable',
                'Consider adjusting the pace based on student engagement',
            ],
        ]);
    }
}
