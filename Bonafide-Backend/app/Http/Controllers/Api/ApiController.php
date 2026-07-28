<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

abstract class ApiController extends Controller
{
    protected function camelCase(array $data): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            $result[lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $key))))] = $value;
        }
        return $result;
    }

    protected function snakeCase(array $data): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            $result[strtolower(preg_replace('/([a-z])([A-Z])/', '$1_$2', $key))] = $value;
        }
        return $result;
    }

    protected function input(Request $request, array $keys): array
    {
        $data = [];
        foreach ($keys as $key) {
            $data[$key] = $request->input($key);
        }
        return $data;
    }

    protected function mapInput(Request $request, array $map): array
    {
        $data = [];
        foreach ($map as $camelKey => $snakeKey) {
            $value = $request->input($camelKey) ?? $request->input($snakeKey);
            if ($value !== null) {
                $data[$snakeKey] = $value;
            }
        }
        return $data;
    }

    protected function userResponse($user): array
    {
        $detail = $user->relationLoaded('teacherDetail') ? $user->teacherDetail : $user->teacherDetail()->first();
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'phone' => $user->phone,
            'hourlyRate' => $detail?->hourly_rate ?? 0,
            'createdAt' => $user->created_at,
        ];
    }
}
