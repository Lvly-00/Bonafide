import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  CalendarClock,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { teacherService } from '@/services'
import { useAuthStore } from '@/stores/authStore'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'default' | 'destructive'> = {
  scheduled: 'secondary',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    teacherService.getDashboardData(user.id).then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  const { stats, todaySessions, recentStudents, upcomingWeek } = data

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Sessions', value: stats.totalSessions, icon: CalendarCheck, color: 'text-purple-600 bg-purple-100' },
    { label: 'Completed This Month', value: stats.completedThisMonth, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Upcoming', value: stats.upcomingSessions, icon: CalendarClock, color: 'text-amber-600 bg-amber-100' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your teaching sessions and students</p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">
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
              <CardTitle>Today's Sessions</CardTitle>
              <Badge variant="secondary" size="sm">{todaySessions.length} sessions</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-2 text-sm text-gray-400">
                  <CalendarCheck className="h-8 w-8" />
                  <p>No sessions scheduled for today</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {todaySessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
                          {session.time}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.studentName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {session.subject} &middot; {session.duration} min
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[session.status] || 'secondary'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Students</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {recentStudents.map((student: any) => (
                <div key={student.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{student.name}</span>
                    <span className="text-xs text-gray-500">{student.subject}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${student.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-xs text-gray-400">
                    <span>Last session: {student.lastSession}</span>
                    <span className="font-semibold text-primary">{student.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Weekly Schedule</CardTitle>
              <CalendarClock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {DAYS_SHORT.map((day) => {
                  const dayData = upcomingWeek.find((d: any) => d.day.startsWith(day))
                  return (
                    <div key={day} className="rounded-lg border border-border p-2.5 text-center">
                      <p className="mb-1.5 text-xs font-semibold text-gray-500">{day}</p>
                      {dayData?.sessions?.length > 0 ? (
                        <div className="space-y-1">
                          {dayData.sessions.map((s: any, i: number) => (
                            <div key={i} className="rounded-md bg-primary-light/50 px-1.5 py-1 text-xs">
                              <p className="font-medium text-primary truncate">{s.time}</p>
                              <p className="truncate text-gray-500">{s.student.split(' ')[0]}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="pt-2 text-xs text-gray-300">—</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
