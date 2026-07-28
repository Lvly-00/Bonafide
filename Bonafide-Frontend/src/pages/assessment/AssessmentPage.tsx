import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Brain,
  Sparkles,
  Target,
  Lightbulb,
  Users,
  ArrowRight,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { assessmentService } from '@/services'
import { assessmentQuestions } from '@/data/assessments'
import { ROUTES } from '@/constants'

const scaleOptions = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
const scaleValues = [1, 2, 3, 4, 5]

const categoryColors: Record<string, string> = {
  'Learning Style': 'bg-blue-100 text-blue-700',
  Auditory: 'bg-purple-100 text-purple-700',
  Attention: 'bg-amber-100 text-amber-700',
  Logic: 'bg-green-100 text-green-700',
  Reading: 'bg-indigo-100 text-indigo-700',
  Memory: 'bg-cyan-100 text-cyan-700',
  Social: 'bg-pink-100 text-pink-700',
  Creativity: 'bg-violet-100 text-violet-700',
  Math: 'bg-orange-100 text-orange-700',
  Processing: 'bg-teal-100 text-teal-700',
  Emotional: 'bg-rose-100 text-rose-700',
  Motivation: 'bg-lime-100 text-lime-700',
  Motor: 'bg-yellow-100 text-yellow-700',
  Comprehension: 'bg-emerald-100 text-emerald-700',
  Executive: 'bg-sky-100 text-sky-700',
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
}

export default function AssessmentPage() {
  const [questions, setQuestions] = useState<typeof assessmentQuestions>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    assessmentService.getQuestions().then(setQuestions)
  }, [])

  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0 && !completed) {
      const timer = setTimeout(() => {
        const progress = Math.round((Object.keys(answers).length / questions.length) * 100)
        assessmentService
          .saveProgress('child-1', Object.entries(answers).map(([qId, answer]) => ({ questionId: Number(qId), answer })), progress)
          .then(() => setSaving(false))
        setSaving(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [answers, questions.length, completed])

  const progress = questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0

  const handleAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questions[currentIdx].id]: value }
        return next
      })
    },
    [currentIdx, questions]
  )

  const goNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setDirection(1)
      setCurrentIdx((i) => i + 1)
    }
  }, [currentIdx, questions.length])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setDirection(-1)
      setCurrentIdx((i) => i - 1)
    }
  }, [currentIdx])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const formatted = Object.entries(answers).map(([qId, answer]) => ({
      questionId: Number(qId),
      answer,
    }))
    const res = await assessmentService.submitAnswers('child-1', formatted)
    setResult(res.result)
    setCompleted(true)
    setSubmitting(false)
  }, [answers])

  const handleRestart = () => {
    setAnswers({})
    setCurrentIdx(0)
    setCompleted(false)
    setResult(null)
    setDirection(1)
  }

  if (completed && result) {
    const radarData = result.scores.map((s: any) => ({
      category: s.category,
      score: s.score,
    }))
    const barData = result.scores.map((s: any) => ({
      category: s.category,
      score: s.score,
      fill: s.score >= 70 ? '#22c55e' : s.score >= 50 ? '#eab308' : '#ef4444',
    }))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assessment Results</h1>
            <p className="text-sm text-gray-500">AI-powered learning profile analysis</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="flex items-center gap-5 p-6">
            <Brain className="h-12 w-12 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Learning Profile
              </p>
              <h2 className="text-xl font-bold">{result.learningProfile.type}</h2>
              <p className="mt-1 text-sm text-gray-600">{result.learningProfile.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scores Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}`, 'Score']}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                    {barData.map((entry: any, idx: number) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((s: string) => (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">Areas to Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.weaknesses.map((w: string) => (
                  <li key={w} className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 shrink-0 text-amber-600" />
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button className="w-full gap-2" onClick={() => window.location.href = ROUTES.MATCHING}>
          View Matching Teachers <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    )
  }

  if (questions.length === 0) return null

  const current = questions[currentIdx]
  const isAnswered = current.id in answers
  const isLast = currentIdx === questions.length - 1

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Learning Assessment</h1>
        <p className="text-sm text-gray-500">Answer 20 questions to discover your child's learning profile</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
            <ProgressRing progress={progress} size={80} strokeWidth={6}>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </ProgressRing>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-gray-500">
                Question {currentIdx + 1} of {questions.length}
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="min-h-[220px]"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge className={categoryColors[current.category] || ''}>
                  {current.category}
                </Badge>
                <span className="text-xs text-gray-400">Q{current.id}</span>
              </div>

              <h2 className="mb-6 text-lg font-semibold leading-snug">{current.question}</h2>

              <div className="space-y-2">
                {scaleOptions.map((option, idx) => {
                  const isSelected = answers[current.id] === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-light ring-1 ring-primary'
                          : 'border-border hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {option}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>

        <span className="text-xs text-gray-400">
          {Object.keys(answers).length} of {questions.length} answered
        </span>

        {isLast ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isAnswered || submitting}
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                Complete Assessment <CheckCircle2 className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button size="sm" onClick={goNext} disabled={!isAnswered}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
