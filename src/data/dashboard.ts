export const parentDashboardData = {
  stats: {
    totalSessions: 24,
    completedSessions: 18,
    upcomingSessions: 4,
    averageRating: 4.8,
    totalChildren: 2,
  },
  upcomingSessions: [
    { id: 'session-3', childName: 'Liam', teacherName: 'Emma Williams', subject: 'Mathematics', date: '2026-08-01', time: '16:00', status: 'confirmed' },
    { id: 'session-4', childName: 'Ava', teacherName: 'James Rodriguez', subject: 'English', date: '2026-08-03', time: '17:00', status: 'pending' },
    { id: 'session-5', childName: 'Liam', teacherName: 'Maya Patel', subject: 'Coding', date: '2026-08-05', time: '15:00', status: 'confirmed' },
    { id: 'session-6', childName: 'Liam', teacherName: 'Emma Williams', subject: 'Mathematics', date: '2026-08-08', time: '16:00', status: 'confirmed' },
  ],
  recentActivity: [
    { id: 'act-1', type: 'session_completed', message: 'Liam completed a Math session with Emma', time: '2 hours ago' },
    { id: 'act-2', type: 'reflection_added', message: 'Emma added a reflection for Liam\'s session', time: '2 hours ago' },
    { id: 'act-3', type: 'booking_confirmed', message: 'Coding session with Maya confirmed for Aug 5', time: '1 day ago' },
    { id: 'act-4', type: 'assessment_completed', message: 'AI Learning Assessment completed for Liam', time: '2 days ago' },
    { id: 'act-5', type: 'message_received', message: 'New message from Maya Patel', time: '3 days ago' },
  ],
  childrenProgress: [
    { id: 'child-1', name: 'Liam', age: 10, grade: '5th Grade', progress: 75, sessionsThisMonth: 8, teacherName: 'Emma Williams' },
    { id: 'child-2', name: 'Ava', age: 13, grade: '8th Grade', progress: 30, sessionsThisMonth: 3, teacherName: 'Not assigned' },
  ],
}

export const teacherDashboardData = {
  stats: {
    totalStudents: 45,
    totalSessions: 320,
    completedThisMonth: 28,
    upcomingSessions: 12,
    averageRating: 4.9,
    totalRevenue: 17600,
    monthlyRevenue: 1540,
    ratingCount: 38,
  },
  todaySessions: [
    { id: 'ts-1', studentName: 'Liam Johnson', time: '16:00', duration: 60, subject: 'Mathematics', status: 'scheduled' },
    { id: 'ts-2', studentName: 'Sophie Brown', time: '17:30', duration: 45, subject: 'Science', status: 'scheduled' },
    { id: 'ts-3', studentName: 'Noah Garcia', time: '18:30', duration: 60, subject: 'Mathematics', status: 'scheduled' },
  ],
  recentStudents: [
    { id: 'child-1', name: 'Liam Johnson', progress: 75, lastSession: '2026-07-28', subject: 'Mathematics' },
    { id: 'child-3', name: 'Sophie Brown', progress: 60, lastSession: '2026-07-27', subject: 'Science' },
    { id: 'child-4', name: 'Noah Garcia', progress: 85, lastSession: '2026-07-26', subject: 'Mathematics' },
    { id: 'child-5', name: 'Emma Davis', progress: 45, lastSession: '2026-07-25', subject: 'Mathematics' },
  ],
  upcomingWeek: [
    { day: 'Monday', sessions: [
      { time: '16:00', student: 'Liam Johnson', subject: 'Math' },
      { time: '17:30', student: 'Sophie Brown', subject: 'Science' },
    ]},
    { day: 'Tuesday', sessions: []},
    { day: 'Wednesday', sessions: [
      { time: '16:00', student: 'Liam Johnson', subject: 'Math' },
      { time: '18:00', student: 'Noah Garcia', subject: 'Math' },
    ]},
    { day: 'Thursday', sessions: []},
    { day: 'Friday', sessions: [
      { time: '15:00', student: 'Liam Johnson', subject: 'Math' },
    ]},
  ],
  recentEarnings: [
    { id: 'earn-1', student: 'Liam Johnson', amount: 55, date: '2026-07-28', status: 'completed' },
    { id: 'earn-2', student: 'Sophie Brown', amount: 55, date: '2026-07-27', status: 'completed' },
    { id: 'earn-3', student: 'Noah Garcia', amount: 55, date: '2026-07-26', status: 'completed' },
    { id: 'earn-4', student: 'Emma Davis', amount: 55, date: '2026-07-25', status: 'completed' },
  ],
}

export const adminDashboardData = {
  stats: {
    totalUsers: 1250,
    totalTeachers: 85,
    totalParents: 480,
    totalBookings: 3200,
    totalRevenue: 176000,
    revenueGrowth: 15.3,
    activeUsers: 680,
    newUsersThisMonth: 124,
    pendingVerifications: 12,
  },
  recentActivities: [
    { id: 'act-1', user: 'Emma Williams', action: 'completed session', target: 'Liam Johnson', time: '2 hours ago' },
    { id: 'act-2', user: 'James Rodriguez', action: 'joined platform', target: '', time: '5 hours ago' },
    { id: 'act-3', user: 'Maya Patel', action: 'submitted verification', target: '', time: '1 day ago' },
    { id: 'act-4', user: 'Sarah Johnson', action: 'created booking', target: 'Maya Patel', time: '1 day ago' },
    { id: 'act-5', user: 'System', action: 'flagged review', target: 'Teacher #42', time: '2 days ago' },
  ],
  verificationQueue: [
    { id: 'v-1', name: 'Maya Patel', email: 'maya@example.com', submittedAt: '2026-07-27', status: 'pending' },
    { id: 'v-2', name: 'Alex Thompson', email: 'alex@example.com', submittedAt: '2026-07-26', status: 'pending' },
  ],
  monthlyBookings: [
    { month: 'Jan', bookings: 210 },
    { month: 'Feb', bookings: 240 },
    { month: 'Mar', bookings: 280 },
    { month: 'Apr', bookings: 260 },
    { month: 'May', bookings: 310 },
    { month: 'Jun', bookings: 350 },
    { month: 'Jul', bookings: 380 },
  ],
  revenueData: [
    { month: 'Jan', revenue: 11500 },
    { month: 'Feb', revenue: 13200 },
    { month: 'Mar', revenue: 15400 },
    { month: 'Apr', revenue: 14300 },
    { month: 'May', revenue: 17050 },
    { month: 'Jun', revenue: 19250 },
    { month: 'Jul', revenue: 20900 },
  ],
}
