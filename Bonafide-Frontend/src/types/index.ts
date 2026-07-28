export type UserRole = 'parent' | 'teacher' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar: string
  phone?: string
  createdAt: string
}

export interface Parent extends User {
  role: 'parent'
  children: string[]
}

export interface Teacher extends User {
  role: 'teacher'
  specialization: string[]
  experience: number
  rating: number
  totalStudents: number
  totalSessions: number
  hourlyRate: number
  bio: string
  availability: Availability[]
  certificates: Certificate[]
  gallery: string[]
  subjects: string[]
  education: string
  languages: string[]
  location: string
}

export interface Admin extends User {
  role: 'admin'
  permissions: string[]
}

export interface Child {
  id: string
  parentId: string
  name: string
  age: number
  grade: string
  avatar: string
  learningConcerns: string[]
  strengths: string[]
  learningStyle: string
  interests: string[]
  schedule: Schedule[]
  profileCompleted: boolean
  teacherId?: string
}

export interface Schedule {
  day: string
  timeSlots: { start: string; end: string }[]
}

export interface Availability {
  day: string
  slots: { start: string; end: string }[]
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  image: string
}

export interface Booking {
  id: string
  parentId: string
  teacherId: string
  childId: string
  childName: string
  parentName: string
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: number
  sessionType: string
  sessionMode?: 'online' | 'face-to-face'
  address?: string
  notes?: string
  feedback?: {
    parent?: { answers: AssessmentAnswer[]; submittedAt: string }
    teacher?: { answers: AssessmentAnswer[]; submittedAt: string }
  }
  createdAt: string
}

export interface Session {
  id: string
  bookingId: string
  teacherId: string
  childId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  topic: string
  notes?: string
  teacherReflection?: TeacherReflection
  parentFeedback?: ParentFeedback
}

export interface TeacherReflection {
  id: string
  sessionId: string
  studentProgress: string
  goals: string
  homework: string
  mood: string
  notes: string
  aiSuggestions: string[]
  createdAt: string
}

export interface ParentFeedback {
  id: string
  sessionId: string
  parentId: string
  teacherId: string
  rating: number
  comment: string
  recommend: boolean
  bookAgain: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'voice' | 'file'
  fileUrl?: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'booking' | 'message' | 'review' | 'system' | 'reminder'
  read: boolean
  createdAt: string
  link?: string
}

export interface Assessment {
  id: string
  childId: string
  status: 'in-progress' | 'completed'
  answers: AssessmentAnswer[]
  result?: AssessmentResult
  progress: number
  startedAt: string
  completedAt?: string
}

export interface AssessmentAnswer {
  questionId: number
  answer: string | number
}

export interface AssessmentResult {
  learningProfile: {
    type: string
    description: string
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  recommendedTeachers: string[]
  scores: {
    category: string
    score: number
  }[]
}

export interface Review {
  id: string
  teacherId: string
  parentId: string
  parentName: string
  parentAvatar: string
  rating: number
  comment: string
  date: string
}

export interface MatchResult {
  teacherId: string
  name: string
  avatar: string
  subjects: string[]
  rating: number
  hourlyRate: number
  experience: number
  education: string
  bio: string
  compatibilityScore: number
  matchReasons: string[]
}

export interface DashboardStats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  averageRating: number
  totalStudents: number
  totalChildren: number
  totalTeachers: number
  totalParents: number
  totalRevenue: number
  revenueGrowth: number
  activeUsers: number
  newUsersThisMonth: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface ProgressData {
  childId: string
  subject: string
  scores: { date: string; score: number }[]
  achievements: Achievement[]
  overallProgress: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
}

export interface LearningPassport {
  childId: string
  subjects: {
    name: string
    level: string
    progress: number
    topics: string[]
  }[]
  badges: Achievement[]
  overallProgress: number
  strengths: string[]
  areasForImprovement: string[]
}
