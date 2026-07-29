import { useEffect, useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  CalendarClock,
  Star,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquare,
  Brain,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardService, bookingService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import AssessmentSurveyModal from '@/pages/booking/AssessmentSurveyModal'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
}

const activityIcons: Record<string, React.ElementType> = {
  session_completed: CheckCircle2,
  reflection_added: BookOpen,
  booking_confirmed: CalendarCheck,
  assessment_completed: Brain,
  message_received: MessageSquare,
}

const activityColors: Record<string, string> = {
  session_completed: 'text-green-600 bg-green-100',
  reflection_added: 'text-blue-600 bg-blue-100',
  booking_confirmed: 'text-purple-600 bg-purple-100',
  assessment_completed: 'text-amber-600 bg-amber-100',
  message_received: 'text-cyan-600 bg-cyan-100',
}

const statusVariant: Record<string, 'success' | 'warning' | 'secondary'> = {
  confirmed: 'success',
  pending: 'warning',
  scheduled: 'secondary',
}

export default function ParentDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [feedbackBookingId, setFeedbackBookingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    dashboardService.getParentDashboard(user.id).then((res) => {
      setData(res)
      setLoading(false)
    })
    bookingService.getByParentId(user.id).then((res) => setBookings(res))
  }, [])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    )
  }

  const { stats, upcomingSessions, recentActivity, childrenProgress } = data

  const statCards: { label: string; value: number; icon: ComponentType<{ className?: string }>; color: string; suffix?: string }[] = [
    { label: 'Total Sessions', value: stats.totalSessions, icon: CalendarCheck, color: 'text-blue-600 bg-blue-100' },
    { label: 'Completed', value: stats.completedSessions, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Upcoming', value: stats.upcomingSessions, icon: CalendarClock, color: 'text-purple-600 bg-purple-100' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Track your children's learning journey</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const [textColor, bgColor] = stat.color.split(' ')
          return (
            <Card key={stat.label} className="overflow-hidden border-0 shadow-md shadow-gray-200/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl p-3.5 ${bgColor} shadow-sm`}>
                  <Icon className={`h-5 w-5 ${textColor}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {stat.value}
                    {stat.suffix && <span className="text-sm font-normal text-gray-500">{stat.suffix}</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-md shadow-gray-200/50">
            <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-blue-400" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              <Badge variant="secondary" size="sm">{upcomingSessions.length} sessions</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{session.childName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {session.teacherName} &middot; {session.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div>
                        <p className="text-xs text-gray-500">{session.date}</p>
                        <p className="text-xs font-medium text-gray-700">{session.time}</p>
                      </div>
                      <Badge variant={statusVariant[session.status] || 'secondary'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-md shadow-gray-200/50">
            <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-500" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Children Progress</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              {childrenProgress.map((child: any) => (
                <div key={child.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{child.name}</span>
                    <span className="text-xs text-gray-500">{child.grade} &middot; {child.sessionsThisMonth} sessions</span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${child.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{child.teacherName}</span>
                    <span className="font-semibold text-primary">{child.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {bookings.filter(b => b.status === 'completed').length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-md shadow-gray-200/50">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Completed Sessions</CardTitle>
              <Star className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {bookings.filter(b => b.status === 'completed').map((session) => (
                  <div key={session.id} className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{session.childName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{session.teacherName} &middot; {session.date}</p>
                    </div>
                    {!session.feedback?.parent ? (
                      <Button size="sm" variant="outline" onClick={() => setFeedbackBookingId(session.id)} className="h-8 px-3 shrink-0 gap-1.5">
                        <Star className="h-3.5 w-3.5" /> Rate
                      </Button>
                    ) : (
                      <Badge variant="secondary" size="sm">Rated</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-md shadow-gray-200/50">
          <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500" />
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity: any, idx: number) => {
                const Icon = activityIcons[activity.type] || ArrowRight
                const colorClass = activityColors[activity.type] || 'text-gray-600 bg-gray-100'
                return (
                  <div key={activity.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className={`rounded-xl p-2.5 ${colorClass} shadow-sm`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gray-400">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {feedbackBookingId && (
        <AssessmentSurveyModal
          bookingId={feedbackBookingId}
          role="parent"
          onClose={() => setFeedbackBookingId(null)}
        />
      )}
    </motion.div>
  )
}
