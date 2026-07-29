import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  BarChart3,
  Star,
  ThumbsUp,
  TrendingUp,
  Lightbulb,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { bookingService, assessmentService, childService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Assessment, Booking, Child } from '@/types'
import parentTeacherAssessmentQuestions from '@/data/parentTeacherAssessments'

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [child, setChild] = useState<Child | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sessionAssessments, setSessionAssessments] = useState<any[]>([])
  const [parentFeedback, setParentFeedback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user?.id) return
    Promise.all([
      childService.getById(id),
      bookingService.getByParentId(user.id),
      assessmentService.getByChildId(id),
      bookingService.getSessionAssessments(id),
      bookingService.getParentFeedbackByChildId(id),
    ]).then(([ch, bks, asm, sas, feedback]) => {
      setChild(ch as Child)
      const childBks = (bks as Booking[]).filter((b) => b.childId === id)
      setBookings(childBks)
      setAssessment(asm)
      setSessionAssessments(sas)
      setParentFeedback(feedback)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, user])

  // Compute overall average from parent feedback answers (scale 1–5)
  const computeOverallAverage = (answers: { questionId: number; answer: number | string }[]) => {
    const scores = answers
      .map((a) => (typeof a.answer === 'number' ? a.answer : Number(a.answer)))
      .filter((v) => !isNaN(v) && v >= 1 && v <= 5)
    if (scores.length === 0) return 0
    return scores.reduce((sum, v) => sum + v, 0) / scores.length
  }

  const feedbackAnswers: { questionId: number; answer: number | string }[] =
    parentFeedback?.answers ?? []
  const overallAvg = feedbackAnswers.length > 0 ? computeOverallAverage(feedbackAnswers) : 0
  const starRating = Math.round(overallAvg) // 1–5

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sm text-gray-400">
        <p>Child not found</p>
        <Button variant="link" onClick={() => navigate('/parent/child-profile')}>Go back</Button>
      </div>
    )
  }

  const completedSessions = bookings.filter((b) => b.status === 'completed').length
  const totalSessions = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length
  const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/parent/child-profile')}
        className="flex items-center gap-1.5 text-gray-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Child Profiles
      </Button>

      {/* Child header */}
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2">
            <AvatarImage src={child.avatar} alt={child.name} />
            <AvatarFallback className="text-lg">{child.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{child.name}</h1>
            <p className="text-sm text-gray-500">{child.age} years old &middot; {child.grade}</p>
            {child.learningStyle && (
              <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                <Brain className="h-3 w-3" /> {child.learningStyle} learner
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {child.interests.slice(0, 5).map((i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <p className="text-xs text-gray-500">Session Progress</p>
            <p className="text-2xl font-bold text-primary">{progress}%</p>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning profile */}
      {(child.learningConcerns?.length > 0 || child.strengths?.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {child.learningConcerns?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Learning Concerns
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {child.learningConcerns.map((c) => (
                    <Badge key={c} className="bg-amber-50 text-amber-700 border-amber-200 text-xs">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {child.strengths?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Star className="h-4 w-4 text-green-500" />
                  Strengths
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {child.strengths.map((s) => (
                    <span key={s} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sessions */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            Sessions
          </h2>
          {bookings.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">No sessions yet</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{b.date}</p>
                      <p className="text-xs text-gray-500">
                        {b.time} &middot; {b.sessionType} &middot; {b.duration} min
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      b.status === 'completed'
                        ? 'success'
                        : b.status === 'confirmed'
                        ? 'secondary'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent assessment result */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            My Assessment
          </h2>
          {feedbackAnswers.length > 0 ? (
            <div className="space-y-4">
              {/* Overall average */}
              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Overall Average</p>
                  <p className="text-xs text-gray-500">
                    Submitted {parentFeedback?.submittedAt
                      ? new Date(parentFeedback.submittedAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < starRating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-amber-700">
                    {overallAvg.toFixed(1)} / 5
                  </span>
                </div>
              </div>

              {/* Per-question breakdown */}
              <div className="space-y-1">
                {parentTeacherAssessmentQuestions.map((q) => {
                  const ans = feedbackAnswers.find((a) => a.questionId === q.id)
                  if (!ans) return null
                  const score =
                    typeof ans.answer === 'number' ? ans.answer : Number(ans.answer) || 0
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between border-b border-gray-100 py-2"
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-xs font-medium text-gray-700">{q.question}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{q.category}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < score ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="w-6 text-right text-xs font-semibold text-gray-700">
                          {score}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-gray-400">No assessment submitted yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Complete a session to unlock the assessment survey
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Session Assessments */}
      {sessionAssessments.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              Session AI Assessments
            </h2>
            <div className="space-y-4">
              {sessionAssessments.map((sa) => (
                <div key={sa.bookingId} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sa.subject}</p>
                      <p className="text-xs text-gray-500">
                        {sa.date} &middot; {sa.teacherName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Effectiveness</span>
                      <span className="text-lg font-bold text-primary">
                        {sa.aiAssessment.overallEffectiveness}%
                      </span>
                    </div>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-gray-600">
                    {sa.aiAssessment.sessionSummary}
                  </p>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-green-50 p-2.5">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                        <ThumbsUp className="h-3 w-3" /> Parent Engagement
                      </div>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        {sa.aiAssessment.parentEngagementScore}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2.5">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
                        <TrendingUp className="h-3 w-3" /> Teacher Engagement
                      </div>
                      <p className="mt-1 text-lg font-bold text-blue-600">
                        {sa.aiAssessment.teacherEngagementScore}%
                      </p>
                    </div>
                  </div>
                  {sa.aiAssessment.strengthsObserved?.length > 0 && (
                    <div className="mb-2">
                      <p className="mb-1 text-xs font-medium text-gray-500">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {sa.aiAssessment.strengthsObserved.map((s: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {sa.aiAssessment.areasToImprove?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-500">Areas to Improve</p>
                      <div className="flex flex-wrap gap-1">
                        {sa.aiAssessment.areasToImprove.map((a: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Learning Assessment */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            AI Learning Assessment
          </h2>
          {assessment?.result ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary-light/30 p-4">
                <p className="text-sm font-semibold text-primary">
                  {assessment.result.learningProfile.type}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {assessment.result.learningProfile.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assessment.result.scores.map((s: any) => (
                  <div key={s.category} className="rounded-lg border border-border p-3">
                    <p className="text-xs text-gray-500">{s.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{s.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              {assessment.result.recommendations?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">Recommendations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assessment.result.recommendations.map((r: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary-light/40 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-gray-400">
              No AI assessment completed yet
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
