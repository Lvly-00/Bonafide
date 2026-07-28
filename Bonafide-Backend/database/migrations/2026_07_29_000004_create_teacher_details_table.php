<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('specialization')->nullable();
            $table->integer('experience')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_students')->default(0);
            $table->integer('total_sessions')->default(0);
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->text('bio')->nullable();
            $table->json('availability')->nullable();
            $table->json('certificates')->nullable();
            $table->json('gallery')->nullable();
            $table->json('subjects')->nullable();
            $table->string('education')->nullable();
            $table->json('languages')->nullable();
            $table->string('location')->nullable();
            $table->timestamps();
        });

        Schema::create('sessions_table', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('child_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('time');
            $table->integer('duration');
            $table->string('status')->default('scheduled');
            $table->string('topic')->nullable();
            $table->text('notes')->nullable();
            $table->json('teacher_reflection')->nullable();
            $table->json('parent_feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions_table');
        Schema::dropIfExists('teacher_details');
    }
};
