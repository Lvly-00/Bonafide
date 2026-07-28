<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'parent_id', 'teacher_id', 'child_id', 'date', 'time', 'duration',
        'status', 'total_amount', 'session_type', 'session_mode', 'address', 'notes', 'feedback',
    ];

    protected function casts(): array
    {
        return [
            'feedback' => 'array',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
