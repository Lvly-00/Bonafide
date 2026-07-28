<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $conversations = Conversation::whereJsonContains('participants', (string) $userId)
            ->orWhereJsonContains('participants', $userId)
            ->get()
            ->map(function ($c) use ($userId) {
                $lastMessage = $c->messages()->latest()->first();
                $unread = $c->messages()->where('receiver_id', $userId)->where('read', false)->count();
                return [
                    'id' => (string) $c->id,
                    'participants' => $c->participants,
                    'lastMessage' => $lastMessage,
                    'unreadCount' => $unread,
                    'updatedAt' => $c->updated_at,
                ];
            });

        return response()->json($conversations);
    }

    public function messages(int $conversationId): JsonResponse
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id' => (string) $m->id,
                'senderId' => (string) $m->sender_id,
                'receiverId' => (string) $m->receiver_id,
                'content' => $m->content,
                'timestamp' => $m->created_at,
                'read' => $m->read,
                'type' => $m->type,
                'fileUrl' => $m->file_url,
            ]);

        return response()->json($messages);
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
            'type' => 'sometimes|string',
        ]);

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'type' => $request->type ?? 'text',
        ]);

        return response()->json($message, 201);
    }
}
