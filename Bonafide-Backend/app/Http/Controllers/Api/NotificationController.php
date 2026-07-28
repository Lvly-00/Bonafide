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
