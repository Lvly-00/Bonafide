<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Child;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $parent = User::where('email', 'sarah@example.com')->first();

        $teacher1 = User::where('email', 'maria@example.com')->first();
        $teacher2 = User::where('email', 'david@example.com')->first();
        $teacher3 = User::where('email', 'emma@example.com')->first();

        if (!$parent) {
            $this->command->warn('Parent not found. Run DatabaseSeeder first.');
            return;
        }

        // Create a test child for the parent
        $child = Child::create([
            'parent_id' => $parent->id,
            'name' => 'Liam Johnson',
            'age' => 9,
            'grade' => '4th Grade',
            'interests' => ['Mathematics', 'Science', 'Art', 'Robotics'],
            'learning_concerns' => ['ADHD', 'Focus Issues'],
            'strengths' => ['Creativity', 'Problem Solving'],
            'learning_style' => 'Kinesthetic, Visual',
            'profile_completed' => true,
        ]);

        $this->command->info('Created child: Liam Johnson');

        // A booking happening ~10 minutes from now (for immediate testing)
        $now = now();
        $in10Min = $now->copy()->addMinutes(10);
        Booking::create([
            'parent_id' => $parent->id,
            'teacher_id' => $teacher1?->id ?? 2,
            'child_id' => $child->id,
            'date' => $in10Min->format('Y-m-d'),
            'time' => $in10Min->format('H:i'),
            'duration' => 60,
            'status' => 'confirmed',
            'total_amount' => 55.00,
            'session_type' => 'One-on-One',
            'session_mode' => 'online',
            'notes' => 'Liam has been struggling with reading comprehension. Please focus on phonics and sight words.',
            'address' => null,
        ]);
        $this->command->info('Created test booking starting ~10 minutes from now');

        // A past completed booking
        Booking::create([
            'parent_id' => $parent->id,
            'teacher_id' => $teacher2?->id ?? 3,
            'child_id' => $child->id,
            'date' => $now->copy()->subDays(2)->format('Y-m-d'),
            'time' => '15:00',
            'duration' => 60,
            'status' => 'completed',
            'total_amount' => 50.00,
            'session_type' => 'One-on-One',
            'session_mode' => 'online',
            'notes' => 'Worked on multiplication tables.',
            'feedback' => [
                'rating' => 5,
                'comment' => 'Great session! Liam was engaged and made good progress.',
                'recommend' => true,
                'bookAgain' => true,
            ],
            'address' => null,
        ]);
        $this->command->info('Created past completed booking');

        // An upcoming booking tomorrow
        Booking::create([
            'parent_id' => $parent->id,
            'teacher_id' => $teacher3?->id ?? 2,
            'child_id' => $child->id,
            'date' => $now->copy()->addDay()->format('Y-m-d'),
            'time' => '16:00',
            'duration' => 90,
            'status' => 'confirmed',
            'total_amount' => 67.50,
            'session_type' => 'Exam Preparation',
            'session_mode' => 'in-person',
            'notes' => 'Preparing for upcoming math test. Focus on fractions and decimals.',
            'address' => '123 Learning Lane, New York, NY',
        ]);
        $this->command->info('Created upcoming booking for tomorrow');
    }
}
