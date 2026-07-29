import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lightbulb,
  Save,
  ClipboardList,
  BookOpen,
  Target,
  Home,
  Smile,
  FileText,
  User,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import api from '@/services/api'
import { mockSessions } from '@/data/sessions'
import type { Session, TeacherReflection } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const fallbackSuggestions = [
  'Try using music-based learning for times tables to improve retention',
  'Incorporate more visual aids for complex concepts like fractions',
  'Consider short breaks every 20 minutes to maintain focus and engagement',
  'Use real-world examples to make abstract concepts more relatable',
  'Introduce gamification elements to increase motivation and participation',
]

const moodOptions = [
  { value: 'happy', label: 'Happy and engaged' },
  { value: 'curious', label: 'Curious and attentive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'frustrated', label: 'Frustrated or struggling' },
  { value: 'distracted', label: 'Distracted or tired' },
]

export default function ReflectionPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [studentProgress, setStudentProgress] = useState('')
  const [goals, setGoals] = useState('')
  const [homework, setHomework] = useState('')
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')
  const [savedReflections, setSavedReflections] = useState<TeacherReflection[]>([])
  const [saving, setSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    const completed = mockSessions.filter(
      (s) => s.status === 'completed'
    ) as unknown as Session[]
    setSessions(completed)
    const existing = completed
      .filter((s) => s.teacherReflection)
      .map((s) => s.teacherReflection!) as TeacherReflection[]
    setSavedReflections(existing)
  }, [])

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const existingReflection = selectedSession?.teacherReflection

  useEffect(() => {
    if (existingReflection) {
      setStudentProgress(existingReflection.studentProgress)
      setGoals(existingReflection.goals)
      setHomework(existingReflection.homework)
      setMood(existingReflection.mood)
      setNotes(existingReflection.notes)
    } else {
      setStudentProgress('')
      setGoals('')
      setHomework('')
      setMood('')
      setNotes('')
    }
    setShowSuggestions(false)
    setAiSuggestions([])
  }, [selectedSessionId, existingReflection])

  const generateAiSuggestions = async () => {
    if (!selectedSessionId || !studentProgress || !goals) return
    setLoadingSuggestions(true)
    try {
      const subject = selectedSession?.topic || 'General'
      const { data } = await api.post('/ai/suggestions', {
        studentProgress,
        goals,
        mood: mood || 'Neutral',
        notes: notes || 'No additional notes',
        subject,
      })
      setAiSuggestions(data.suggestions || fallbackSuggestions)
    } catch {
      setAiSuggestions(fallbackSuggestions)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSessionId) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    const newReflection: TeacherReflection = {
      id: `ref-${Date.now()}`,
      sessionId: selectedSessionId,
      studentProgress,
      goals,
      homework,
      mood,
      notes,
      aiSuggestions: aiSuggestions.slice(0, 3),
      createdAt: new Date().toISOString(),
    }
    setSavedReflections((prev) => [newReflection, ...prev])
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Session Reflection</h1>
        <p className="text-sm text-gray-500">Record your thoughts after each session</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="w-full sm:w-72">
            <Select
              options={[
                { value: '', label: 'Select a session...' },
                ...sessions.map((s) => ({
                  value: s.id,
                  label: `${s.topic} - ${s.date} (${s.time})`,
                })),
              ]}
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              placeholder="Select a session..."
            />
          </div>
        </CardContent>
      </Card>

      {selectedSessionId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-gray-400" />
                Reflection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-400" /> Student Progress
                </label>
                <Textarea
                  value={studentProgress}
                  onChange={(e) => setStudentProgress(e.target.value)}
                  placeholder="Describe the student's progress in today's session..."
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Target className="h-4 w-4 text-gray-400" /> Goals Met
                </label>
                <Textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What goals were achieved this session?"
                  rows={2}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Home className="h-4 w-4 text-gray-400" /> Homework Assigned
                </label>
                <Textarea
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="List any homework or practice assigned..."
                  rows={2}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Smile className="h-4 w-4 text-gray-400" /> Student Mood
                </label>
                <Select
                  options={moodOptions}
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Select student mood..."
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <ClipboardList className="h-4 w-4 text-gray-400" /> Additional Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations or notes..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle
                className="flex cursor-pointer items-center gap-2 text-base"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Lightbulb className="h-4 w-4 text-amber-500" />
                AI Suggestions
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {showSuggestions ? 'Hide' : 'Show'}
                </Badge>
              </CardTitle>
            </CardHeader>
            {showSuggestions && (
              <CardContent>
                <div className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAiSuggestions}
                    disabled={loadingSuggestions || !studentProgress || !goals}
                    className="gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {loadingSuggestions ? 'Generating...' : 'Generate AI Suggestions'}
                  </Button>
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3"
                        >
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <p className="text-sm text-amber-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </motion.div>
      )}

      {savedReflections.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-gray-400" />
              Previous Reflections
            </CardTitle>
            <Badge variant="secondary">{savedReflections.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedReflections.map((ref) => (
              <div
                key={ref.id}
                className="rounded-xl border border-border p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Session: {ref.sessionId.replace('session-', 'Session #')}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(ref.createdAt)}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Progress: </span>
                    {ref.studentProgress}
                  </p>
                  {ref.goals && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Goals: </span>
                      {ref.goals}
                    </p>
                  )}
                  {ref.mood && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Mood: </span>
                      {ref.mood}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
