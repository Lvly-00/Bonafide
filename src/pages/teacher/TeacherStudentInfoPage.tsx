import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { teacherService, assessmentService } from '@/services'
import { mockBookings } from '@/data/bookings'
import type { Assessment } from '@/types'

export default function TeacherStudentInfoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<any>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teacherService.getDashboardData('teacher-1').then((data) => {
      const found = data.recentStudents.find((s: any) => s.id === id)
      setStudent(found || null)
      setLoading(false)
    })
    if (id) {
      assessmentService.getByChildId(id).then(setAssessment)
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sm text-gray-400">
        <p>Student not found</p>
        <Button variant="link" onClick={() => navigate('/teacher/students')}>Go back</Button>
      </div>
    )
  }

  const bookings = mockBookings.filter(
    (b) => b.childId === student.id && b.teacherId === 'teacher-1'
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/students')} className="flex items-center gap-1.5 text-gray-500">
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Button>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name.toLowerCase().replace(/\s+/g, '-')}`} />
            <AvatarFallback className="text-lg">{student.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{student.name}</h1>
            <p className="text-sm text-gray-500">{student.subject}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span>Progress: {student.progress}%</span>
              <span>&middot;</span>
              <span>Last session: {student.lastSession}</span>
            </div>
            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${student.progress}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            Past Sessions
          </h2>
          {bookings.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No past sessions</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{b.date}</p>
                      <p className="text-xs text-gray-500">{b.time} &middot; {b.sessionType} &middot; {b.duration} min</p>
                    </div>
                  </div>
                  <Badge variant={b.status === 'completed' ? 'success' : b.status === 'confirmed' ? 'secondary' : 'warning'} size="sm">
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            AI Assessment
          </h2>
          {assessment ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary-light/30 p-4">
                <p className="text-sm font-medium text-primary">{assessment.result.learningProfile.type}</p>
                <p className="mt-1 text-xs text-gray-600">{assessment.result.learningProfile.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assessment.result.scores.map((s: any) => (
                  <div key={s.category} className="rounded-lg border border-border p-3">
                    <p className="text-xs text-gray-500">{s.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-sm font-semibold">{s.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Recommendations</p>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.result.recommendations.map((r: string, i: number) => (
                    <span key={i} className="rounded-full bg-primary-light/40 px-3 py-1 text-xs font-medium text-primary">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No assessment completed yet</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
