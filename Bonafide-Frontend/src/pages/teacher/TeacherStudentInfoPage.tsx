import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Calendar, Clock, BarChart3, Target, Lightbulb, ThumbsUp, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { bookingService, assessmentService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Assessment, Booking } from '@/types'
import parentTeacherAssessmentQuestions from '@/data/parentTeacherAssessments'

export default function TeacherStudentInfoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [student, setStudent] = useState<any>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sessionAssessments, setSessionAssessments] = useState<any[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [parentFeedback, setParentFeedback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user?.id) return
    Promise.all([
      bookingService.getByTeacherId(user.id),
      assessmentService.getByChildId(id),
      bookingService.getSessionAssessments(id),
      bookingService.getParentFeedbackByChildId(id),
    ]).then(([bks, asm, sas, feedback]) => {
      const childBks = bks.filter((b: Booking) => b.childId === id)
      setBookings(childBks)
      setAssessment(asm)
      setSessionAssessments(sas)
      setParentFeedback(feedback)
      if (childBks.length > 0) {
        const total = childBks.filter((b) => b.status === 'confirmed' || b.status === 'completed').length
        const completed = childBks.filter((b) => b.status === 'completed').length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0
        setStudent({
          id,
          name: childBks[0].childName,
          progress,
          lastSession: childBks[childBks.length - 1]?.date || 'N/A',
          subject: childBks[0].sessionType,
          feedbackAssessment: feedback?.assessment || null,
        })
      } else {
        setStudent(null)
      }
      setLoading(false)
    })
  }, [id, user])

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
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            Parent Assessment
          </h2>
          {student?.feedbackAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Overall Rating</p>
                  <p className="text-xs text-gray-500">Submitted {new Date(student.feedbackAssessment.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.ceil(student.feedbackAssessment.overallScore / 20) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`}
                    />
                  ))}
                  <span className="text-sm font-semibold ml-2">{Math.round(student.feedbackAssessment.overallScore)}/5</span>
                </div>
              </div>
              <div className="space-y-2">
                {parentTeacherAssessmentQuestions.map((q) => {
                  const answer = student.feedbackAssessment.answers.find((a) => a.questionId === q.id)
                  if (!answer) return null
                  const score = typeof answer.answer === 'number' ? answer.answer : parseInt(answer.answer) || 0
                  const scoreMap = { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 }
                  const displayScore = scoreMap[answer.answer as keyof typeof scoreMap] || score
                  return (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">{q.question}</p>
                        <p className="text-xs text-gray-400 capitalize">{q.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < displayScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold w-8 text-right">{displayScore}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 py-4 text-center">No parent assessment completed yet</div>
          )}
        </CardContent>
      </Card>

      {sessionAssessments.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              Session Survey AI Assessments
            </h2>
            <div className="space-y-4">
              {sessionAssessments.map((sa) => (
                <div key={sa.bookingId} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sa.subject}</p>
                      <p className="text-xs text-gray-500">{sa.date} &middot; {sa.teacherName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Effectiveness</span>
                      <span className="text-lg font-bold text-primary">{sa.aiAssessment.overallEffectiveness}%</span>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-gray-600 leading-relaxed">{sa.aiAssessment.sessionSummary}</p>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-green-50 p-2.5">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                        <ThumbsUp className="h-3 w-3" /> Parent Engagement
                      </div>
                      <p className="mt-1 text-lg font-bold text-green-600">{sa.aiAssessment.parentEngagementScore}%</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2.5">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
                        <TrendingUp className="h-3 w-3" /> Teacher Engagement
                      </div>
                      <p className="mt-1 text-lg font-bold text-blue-600">{sa.aiAssessment.teacherEngagementScore}%</p>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Alignment:</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${sa.aiAssessment.alignmentScore}%` }} />
                    </div>
                    <span className="font-semibold text-purple-600">{sa.aiAssessment.alignmentScore}%</span>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-medium text-gray-500">Child Progress Insight</p>
                    <p className="text-xs text-gray-600">{sa.aiAssessment.childProgressInsight}</p>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-medium text-gray-500">Teaching Quality Insight</p>
                    <p className="text-xs text-gray-600">{sa.aiAssessment.teachingQualityInsight}</p>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-medium text-gray-500">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {sa.aiAssessment.strengthsObserved?.map((s: string, i: number) => (
                        <span key={i} className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-medium text-gray-500">Areas to Improve</p>
                    <div className="flex flex-wrap gap-1">
                      {sa.aiAssessment.areasToImprove?.map((a: string, i: number) => (
                        <span key={i} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Recommendations</p>
                    <div className="flex flex-wrap gap-1">
                      {sa.aiAssessment.recommendations?.map((r: string, i: number) => (
                        <span key={i} className="rounded-full bg-primary-light/40 px-2.5 py-0.5 text-xs font-medium text-primary">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            AI Assessment
          </h2>
          {assessment?.result ? (
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
