<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherDetail extends Model
{
    protected $fillable = [
        'user_id', 'specialization', 'experience', 'rating', 'total_students',
        'total_sessions', 'hourly_rate', 'bio', 'availability', 'certificates',
        'gallery', 'subjects', 'education', 'languages', 'location',
    ];

    protected function casts(): array
    {
        return [
            'specialization' => 'array',
            'availability' => 'array',
            'certificates' => 'array',
            'gallery' => 'array',
            'subjects' => 'array',
            'languages' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
