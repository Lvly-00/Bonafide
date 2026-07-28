<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Progress extends Model
{
    protected $fillable = [
        'child_id', 'subject', 'scores', 'achievements', 'overall_progress',
    ];

    protected function casts(): array
    {
        return [
            'scores' => 'array',
            'achievements' => 'array',
        ];
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
