<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->integer('age');
            $table->string('grade');
            $table->string('avatar')->nullable();
            $table->json('learning_concerns')->nullable();
            $table->json('strengths')->nullable();
            $table->string('learning_style')->nullable();
            $table->json('interests')->nullable();
            $table->json('schedule')->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
