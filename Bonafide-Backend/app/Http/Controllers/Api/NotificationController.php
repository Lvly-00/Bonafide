<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($n) => [
                'id' => (string) $n->id,
                'userId' => (string) $n->user_id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'read' => $n->read,
                'createdAt' => $n->created_at,
                'link' => $n->link,
            ]);

        return response()->json($notifications);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string',
            'link' => 'nullable|string',
        ]);

        $notification = Notification::create([
            'user_id' => $request->userId,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'read' => false,
            'link' => $request->link ?? '',
        ]);

        return response()->json([
            'id' => (string) $notification->id,
            'userId' => (string) $notification->user_id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'read' => $notification->read,
            'createdAt' => $notification->created_at,
            'link' => $notification->link,
        ], 201);
    }

    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);
        return response()->json(['message' => 'All marked as read']);
    }

    public function destroy(int $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }
}
