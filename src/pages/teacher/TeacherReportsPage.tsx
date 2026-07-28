import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, BookOpen, ArrowUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { teacherService } from '@/services'

export default function TeacherReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teacherService.getDashboardData('teacher-1').then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const { stats, recentStudents } = data

  const reportCards = [
    { label: 'Total Sessions', value: stats.totalSessions, icon: BookOpen, color: 'text-blue-600 bg-blue-100', change: '+12%' },
    { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-green-600 bg-green-100', change: '+5%' },
    { label: 'Avg. Rating', value: stats.averageRating, icon: TrendingUp, color: 'text-amber-600 bg-amber-100', suffix: '/5', change: '+0.1' },
    { label: 'Completion Rate', value: `${Math.round((stats.completedThisMonth / (stats.completedThisMonth + stats.upcomingSessions)) * 100)}%`, icon: BarChart3, color: 'text-purple-600 bg-purple-100', change: '+3%' },
  ]

  const subjectData = [
    { subject: 'Mathematics', sessions: 45, students: 12, avgProgress: 72 },
    { subject: 'Science', sessions: 28, students: 8, avgProgress: 68 },
    { subject: 'Physics', sessions: 18, students: 5, avgProgress: 75 },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Performance overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-0.5 text-[10px]">
                    <ArrowUp className="h-3 w-3" />
                    {card.change}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {card.value}{card.suffix && <span className="text-sm font-normal text-gray-400">{card.suffix}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectData.map((subj) => (
              <div key={subj.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{subj.subject}</span>
                  <span className="text-xs text-gray-500">{subj.students} students &middot; {subj.sessions} sessions</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${subj.avgProgress}%` }}
                  />
                </div>
                <p className="mt-0.5 text-right text-xs font-medium text-primary">{subj.avgProgress}% avg. progress</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Student Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentStudents.map((student: any) => (
            <div key={student.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{student.name}</span>
                <span className="text-xs text-gray-500">{student.subject}</span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
              <p className="mt-0.5 text-right text-xs text-gray-400">{student.progress}% &middot; Last: {student.lastSession}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
