import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, User, BookOpen, Star, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { bookingService, childService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Booking } from '@/types'
import AssessmentSurveyModal from '@/pages/booking/AssessmentSurveyModal'

export default function TeacherApprovalsPage() {
  const user = useAuthStore((s) => s.user)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    bookingService.getByTeacherId(user.id).then((data) => {
      setBookings(data)
      setLoading(false)
    })
  }, [user?.id])

  const refresh = () => {
    if (!user?.id) return
    bookingService.getByTeacherId(user.id).then((data) => setBookings(data))
  }

  const handleStatus = async (id: string, status: string) => {
    await bookingService.updateStatus(id, status)
    refresh()
  }

  const [feedbackBookingId, setFeedbackBookingId] = useState<string | null>(null)
  const [profileChildId, setProfileChildId] = useState<string | null>(null)
  const [learningProfile, setLearningProfile] = useState<any>(null)

  const loadProfile = async (childId: string) => {
    if (profileChildId === childId) {
      setProfileChildId(null)
      setLearningProfile(null)
      return
    }
    setProfileChildId(childId)
    const data = await childService.getLearningProfile(childId)
    setLearningProfile(data)
  }

  const canComplete = (b: Booking) => {
    if (b.status !== 'confirmed') return false
    const [h, m] = b.time.split(':').map(Number)
    const start = new Date(b.date)
    start.setHours(h, m, 0, 0)
    const end = new Date(start.getTime() + b.duration * 60000)
    return new Date() >= end
  }

  const pending = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const completed = bookings.filter(b => b.status === 'completed')

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Booking Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">{pending.length} pending request{pending.length !== 1 ? 's' : ''}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-2 text-sm text-gray-400">
              <Check className="h-8 w-8" />
              <p>All caught up — no pending requests</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pending.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between px-5 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.childId}`} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{b.childName}</p>
                        <p className="text-[11px] text-gray-500">Parent: {b.parentName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{b.date}</span>
                          <span>&middot;</span>
                          <span>{b.time}</span>
                          <span>&middot;</span>
                          <span>{b.duration} min</span>
                          <span>&middot;</span>
                          <span className="capitalize">{b.sessionMode || 'online'}</span>
                        </div>
                        {b.sessionMode === 'face-to-face' && b.address && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{b.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => loadProfile(b.childId)} className="h-8 px-2" title="View learning profile">
                        <Brain className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="success" onClick={() => handleStatus(b.id, 'confirmed')} className="h-8 px-3">
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatus(b.id, 'cancelled')} className="h-8 px-3">
                        <X className="h-3.5 w-3.5 mr-1" /> Decline
                      </Button>
                    </div>
                  </div>
                  {profileChildId === b.childId && learningProfile && (
                    <div className="border-t border-border px-5 py-3 text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Style:</span> {learningProfile.profile.learningProfileType || learningProfile.profile.learningStyle || 'Not assessed'}</p>
                      {learningProfile.profile.interests?.length > 0 && (
                        <p><span className="font-medium">Interests:</span> {learningProfile.profile.interests.join(', ')}</p>
                      )}
                      {learningProfile.profile.initialStrengths?.length > 0 && (
                        <p><span className="font-medium">Strengths:</span> {learningProfile.profile.initialStrengths.join(', ')}</p>
                      )}
                      {learningProfile.profile.initialWeaknesses?.length > 0 && (
                        <p><span className="font-medium">Areas to improve:</span> {learningProfile.profile.initialWeaknesses.join(', ')}</p>
                      )}
                      {learningProfile.subjects?.map((s: any) => (
                        <p key={s.name}><span className="font-medium">{s.name}:</span> {s.progress}% progress</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Confirmed Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {confirmed.length === 0 ? (
            <p className="px-5 pb-6 pt-2 text-center text-sm text-gray-400">No confirmed sessions</p>
          ) : (
            <div className="divide-y divide-border">
              {confirmed.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.childId}`} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{b.childName}</p>
                      <p className="text-xs text-gray-500">{b.date} &middot; {b.time} &middot; {b.duration} min &middot; <span className="capitalize">{b.sessionMode || 'online'}</span></p>
                      {b.sessionMode === 'face-to-face' && b.address && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{b.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">Confirmed</Badge>
                    {canComplete(b) ? (
                      <Button size="sm" variant="outline" onClick={async () => { await handleStatus(b.id, 'completed'); setFeedbackBookingId(b.id); }} className="h-8 px-3">
                        <Check className="h-3.5 w-3.5 mr-1" /> Complete
                      </Button>
                    ) : (
                      <span className="text-[11px] text-gray-400">Scheduled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {completed.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.childId}`} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{b.childName}</p>
                      <p className="text-xs text-gray-500">{b.date} &middot; {b.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {feedbackBookingId && (
        <AssessmentSurveyModal
          bookingId={feedbackBookingId}
          role="teacher"
          onClose={() => setFeedbackBookingId(null)}
        />
      )}
    </motion.div>
  )
}
