import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Skeleton } from '@/components/ui/skeleton'
import { Select } from '@/components/ui/select'
import { progressService, childService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { LearningPassport, ProgressData, Child } from '@/types'

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

const subjectColors: Record<string, string> = {
  Mathematics: 'from-blue-500 to-blue-600',
  Science: 'from-green-500 to-green-600',
  English: 'from-purple-500 to-purple-600',
}

const subjectBadgeColors: Record<string, 'default' | 'secondary' | 'success'> = {
  Beginner: 'secondary',
  Intermediate: 'default',
  Advanced: 'success',
}

function BadgeCard({ badge }: { badge: { id: string; title: string; description: string; icon: string; unlockedAt: string } }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 transition-shadow hover:shadow-sm">
      <div className="rounded-full bg-amber-100 p-2.5 text-amber-600">
        <Award className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{badge.title}</p>
        <p className="text-xs text-gray-500">{badge.description}</p>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const user = useAuthStore((s) => s.user)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [passport, setPassport] = useState<LearningPassport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    childService.getByParentId(user.id).then((data) => {
      setChildren(data)
      if (data.length > 0) setSelectedChild(data[0].id)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!selectedChild) return
    Promise.all([
      progressService.getByChildId(selectedChild),
      progressService.getLearningPassport(selectedChild),
    ]).then(([progress, learningPassport]) => {
      setProgressData(progress)
      setPassport(learningPassport)
    })
  }, [selectedChild])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  const chartData =
    progressData.length > 0
      ? progressData[0].scores.map((s) => ({
          date: new Date(s.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          score: s.score,
        }))
      : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <p className="text-sm text-gray-500">Track academic growth and achievements</p>
        </div>
        <div className="w-40">
          <Select
            options={children.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          />
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Learning Passport</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {passport?.subjects.map((subject) => (
                <div
                  key={subject.name}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{subject.name}</span>
                    <Badge variant={subjectBadgeColors[subject.level] || 'outline'}>
                      {subject.level}
                    </Badge>
                  </div>
                  <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' as const }}
                      className={`h-full rounded-full bg-gradient-to-r ${subjectColors[subject.name] || 'from-gray-500 to-gray-600'}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {subject.progress}% complete &middot; {subject.topics.length} topics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {subject.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-[10px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {passport && passport.subjects.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No subjects added yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Score Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-gray-500">No score data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ProgressRing progress={passport?.overallProgress || 0} size={140} strokeWidth={10}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{passport?.overallProgress || 0}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </ProgressRing>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Strengths</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {passport && passport.strengths.length > 0 ? (
                <div className="space-y-2">
                  {passport.strengths.map((strength) => (
                    <div
                      key={strength}
                      className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">No strengths identified yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Areas for Improvement</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {passport && passport.areasForImprovement.length > 0 ? (
                <div className="space-y-2">
                  {passport.areasForImprovement.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{area}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">No areas for improvement noted</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {passport && passport.badges.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Badges & Achievements</CardTitle>
              <Award className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {passport.badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
