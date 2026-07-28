import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, RefreshCw, Send, MessageSquare, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockSessions } from '@/data/sessions'
import type { Session, ParentFeedback } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function FeedbackPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [recommend, setRecommend] = useState(true)
  const [bookAgain, setBookAgain] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [previousFeedback, setPreviousFeedback] = useState<ParentFeedback[]>([])

  useEffect(() => {
    const completed = mockSessions.filter(
      (s) => s.status === 'completed'
    ) as unknown as Session[]
    setSessions(completed)
    const existing = completed
      .filter((s) => s.parentFeedback)
      .map((s) => s.parentFeedback!) as ParentFeedback[]
    setPreviousFeedback(existing)
  }, [])

  const canSubmit = selectedSessionId && rating > 0 && comment.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || !selectedSessionId) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    const feedback: ParentFeedback = {
      id: `fb-${Date.now()}`,
      sessionId: selectedSessionId,
      parentId: 'parent-1',
      teacherId: sessions.find((s) => s.id === selectedSessionId)?.teacherId || '',
      rating,
      comment: comment.trim(),
      recommend,
      bookAgain,
      createdAt: new Date().toISOString(),
    }
    setPreviousFeedback((prev) => [feedback, ...prev])
    setRating(0)
    setComment('')
    setRecommend(true)
    setBookAgain(true)
    setSelectedSessionId('')
    setSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Session Feedback</h1>
        <p className="text-sm text-gray-500">Share your experience with the teacher</p>
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
                <Star className="h-4 w-4 text-amber-500" />
                Rate Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= (hoverRating || rating)
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="rounded-lg p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            filled
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-none text-gray-300'
                          }`}
                        />
                      </button>
                    )
                  })}
                  <span className="ml-2 text-sm text-gray-500">
                    {rating > 0 ? `${rating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-gray-400" /> Comment
                  </span>
                  <span className={`text-xs ${comment.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                    {comment.length}/500
                  </span>
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setComment(e.target.value)
                  }}
                  placeholder="Share your thoughts about the session..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={recommend}
                    onChange={(e) => setRecommend(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Recommend this teacher</p>
                    <p className="text-xs text-gray-500">To other parents</p>
                  </div>
                  <ThumbsUp className={`h-5 w-5 ${recommend ? 'text-primary' : 'text-gray-300'}`} />
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={bookAgain}
                    onChange={(e) => setBookAgain(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Book again</p>
                    <p className="text-xs text-gray-500">For future sessions</p>
                  </div>
                  <RefreshCw className={`h-5 w-5 ${bookAgain ? 'text-primary' : 'text-gray-300'}`} />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </motion.div>
      )}

      {previousFeedback.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              Previous Feedback
            </CardTitle>
            <Badge variant="secondary">{previousFeedback.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {previousFeedback.map((fb) => (
              <div
                key={fb.id}
                className="rounded-xl border border-border p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Session: {fb.sessionId.replace('session-', '#')}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < fb.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-none text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(fb.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{fb.comment}</p>
                <div className="mt-2 flex gap-3">
                  {fb.recommend && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <ThumbsUp className="h-3 w-3" /> Recommended
                    </span>
                  )}
                  {fb.bookAgain && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <RefreshCw className="h-3 w-3" /> Would book again
                    </span>
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
