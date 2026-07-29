<?php

namespace Database\Seeders;

use App\Models\TeacherDetail;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $parent = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'sarah@example.com',
            'password' => bcrypt('password'),
            'role' => 'parent',
            'phone' => '+1 (555) 123-4567',
        ]);

        // Original general-subject teachers
        $teacher1 = User::create([
            'name' => 'Emma Wilson',
            'email' => 'emma@example.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'phone' => '+1 (555) 234-5678',
        ]);

        TeacherDetail::create([
            'user_id' => $teacher1->id,
            'specialization' => ['Mathematics', 'Science'],
            'experience' => 8,
            'rating' => 4.8,
            'hourly_rate' => 45,
            'bio' => 'Experienced math and science teacher.',
            'subjects' => ['Mathematics', 'Physics', 'Chemistry'],
            'availability' => [],
            'education' => 'B.S. in Mathematics Education',
            'languages' => ['English'],
            'location' => 'New York, NY',
        ]);

        $teacher2 = User::create([
            'name' => 'James Brown',
            'email' => 'james@example.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'phone' => '+1 (555) 345-6789',
        ]);

        TeacherDetail::create([
            'user_id' => $teacher2->id,
            'specialization' => ['English', 'Literature'],
            'experience' => 5,
            'rating' => 4.6,
            'hourly_rate' => 40,
            'bio' => 'Passionate English literature teacher.',
            'subjects' => ['English', 'Literature', 'Writing'],
            'availability' => [],
            'education' => 'M.A. in English Literature',
            'languages' => ['English'],
            'location' => 'Los Angeles, CA',
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@learnlink.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '+1 (555) 456-7890',
        ]);

        // Special needs specialist teachers
        $this->call(TeacherSeeder::class);

        // Test bookings with a child
        $this->call(BookingSeeder::class);
    }
}
