export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PARENT_DASHBOARD: '/parent/dashboard',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CHILD_PROFILE: '/parent/child-profile',
  CHILD_PROFILE_EDIT: '/parent/child-profile/:id',
  CHILD_PROFILE_NEW: '/parent/child-profile/new',
  CHILD_DETAIL: '/parent/child/:id',
  ASSESSMENT: '/parent/assessment',
  ASSESSMENT_RESULT: '/parent/assessment/:id/result',
  MATCHING: '/parent/matching',
  TEACHERS: '/teachers',
  TEACHER_PROFILE: '/parent/teacher/:id',
  BOOKING: '/parent/booking/:teacherId',
  BOOKING_CONFIRMATION: '/parent/booking/confirmation/:id',
  MESSAGES: '/messages',
  MESSAGE_CONVERSATION: '/messages/:id',
  NOTIFICATIONS: '/notifications',
  PROGRESS: '/parent/progress',
  PARENT_FEEDBACK: '/parent/feedback',
  REFLECTION: '/teacher/reflection',
  TEACHER_REFLECTION: '/teacher/reflection',
  SETTINGS: '/settings',
  TEACHER_SESSIONS: '/teacher/sessions',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_STUDENT_INFO: '/teacher/students/:id',
  TEACHER_APPROVALS: '/teacher/approvals',
  TEACHER_CALENDAR: '/teacher/calendar',
  TEACHER_PROFILE_SETTINGS: '/teacher/profile',
  TEACHER_MESSAGES: '/teacher/messages',
  TEACHER_REPORTS: '/teacher/reports',
  ADMIN_USERS: '/admin/users',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_VERIFICATION: '/admin/verification',
} as const

export const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'French',
  'Spanish',
  'Arabic',
] as const

export const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic',
] as const

export const LEARNING_CONCERNS = [
  'ADHD',
  'Dyslexia',
  'Dyscalculia',
  'Anxiety',
  'Autism Spectrum',
  'Slow Processing',
  'Memory Retention',
  'Focus Issues',
  'None',
] as const

export const SESSION_TYPES = [
  'One-on-One',
  'Group Session',
  'Homework Help',
  'Exam Preparation',
  'Concept Review',
  'Skill Building',
] as const

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
] as const

export const GRADES = [
  'Kindergarten',
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade',
] as const
