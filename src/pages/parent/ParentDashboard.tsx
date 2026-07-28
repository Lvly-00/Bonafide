import { useEffect, useState } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardService } from '@/services'

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
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getParentDashboard('parent-1').then((res) => {
      setData(res)
      setLoading(false)
    })
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

  const statCards = [
    { label: 'Total Sessions', value: stats.totalSessions, icon: CalendarCheck, color: 'text-blue-600 bg-blue-100' },
    { label: 'Completed', value: stats.completedSessions, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Upcoming', value: stats.upcomingSessions, icon: CalendarClock, color: 'text-purple-600 bg-purple-100' },
    { label: 'Average Rating', value: stats.averageRating, icon: Star, color: 'text-amber-600 bg-amber-100', suffix: '/5' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Track your children's learning journey</p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Sessions</CardTitle>
              <Badge variant="secondary" size="sm">{upcomingSessions.length} sessions</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Children Progress</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="space-y-5">
              {childrenProgress.map((child: any) => (
                <div key={child.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{child.name}</span>
                    <span className="text-xs text-gray-500">{child.grade} &middot; {child.sessionsThisMonth} sessions</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${child.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{child.teacherName}</span>
                    <span className="font-semibold text-primary">{child.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity: any, idx: number) => {
                const Icon = activityIcons[activity.type] || ArrowRight
                const colorClass = activityColors[activity.type] || 'text-gray-600 bg-gray-100'
                return (
                  <div key={activity.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 truncate">{activity.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
