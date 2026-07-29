<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Child extends Model
{
    protected $fillable = [
        'parent_id', 'name', 'age', 'grade', 'avatar', 'learning_concerns',
        'strengths', 'learning_style', 'interests',
        'profile_completed', 'teacher_id',
    ];

    protected function casts(): array
    {
        return [
            'learning_concerns' => 'array',
            'strengths' => 'array',
            'interests' => 'array',
            'profile_completed' => 'boolean',
        ];
    }

    public function bookingProgress(): int
    {
        $total = $this->bookings()->whereIn('status', ['confirmed', 'completed'])->count();
        if ($total === 0) return 0;
        $completed = $this->bookings()->where('status', 'completed')->count();
        return (int) round(($completed / $total) * 100);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }
}
