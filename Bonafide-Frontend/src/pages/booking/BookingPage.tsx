import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  Trash2,
  Clock3,
  Globe,
  Home,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { childService, teacherService, bookingService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Teacher, Child } from '@/types'
import { TIME_SLOTS } from '@/constants'


const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const durationOptions = [
  { value: '1', label: '1 minute' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '120 minutes' },
]

const DAY_MAP: Record<string, string> = {
  Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
}

function getDayAvailability(teacher: Teacher, dayName: string) {
  const fullName = DAY_MAP[dayName] || dayName
  const avail = teacher.availability?.find(
    (a) => a.day.toLowerCase() === fullName.toLowerCase()
  )
  const slots = avail?.slots || []
  if (slots.length === 0) return []
  if (typeof slots[0] === 'string') {
    const result: { start: string; end: string }[] = []
    for (const t of slots as string[]) {
      const [h] = t.split(':').map(Number)
      const next = `${String(h + 1).padStart(2, '0')}:00`
      result.push({ start: t, end: next })
    }
    return result
  }
  return slots
}

function getDayChildSchedule(child: Child | null, dayName: string) {
  if (!child) return []
  const fullName = DAY_MAP[dayName] || dayName
  const entry = child.schedule?.find(
    (s) => s.day.toLowerCase() === fullName.toLowerCase()
  )
  return entry?.timeSlots || []
}

function generateTimeSlots(slots: { start: string; end: string }[]) {
  const times: string[] = []
  for (const slot of slots) {
    if (!slot?.start || !slot?.end) continue
    const [sh, sm] = slot.start.split(':').map(Number)
    const [eh, em] = slot.end.split(':').map(Number)
    if (isNaN(sh) || isNaN(eh)) continue
    let h = sh
    while (h < eh || (h === eh && 0 < em)) {
      times.push(`${String(h).padStart(2, '0')}:00`)
      h++
    }
  }
  return times
}

export default function BookingPage() {
  const user = useAuthStore((s) => s.user)
  const { teacherId } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const stateData = (location.state as { preselectedChild?: Child } | null)
  const preselectedChild = stateData?.preselectedChild

  const [step, setStep] = useState(preselectedChild ? 2 : 1)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingBookings, setExistingBookings] = useState<{ date: string; time: string }[]>([])

  const [selectedChildId, setSelectedChildId] = useState(preselectedChild?.id ?? '')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [activeDate, setActiveDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [sessionMode, setSessionMode] = useState<'online' | 'face-to-face'>('online')
  const [address, setAddress] = useState('')
  const [sessions, setSessions] = useState<{ date: string; time: string; duration: number }[]>([])
  const [viewingMonth, setViewingMonth] = useState(() => new Date().getMonth())
  const [viewingYear, setViewingYear] = useState(() => new Date().getFullYear())

  const [receipt, setReceipt] = useState<{
    sessions: { date: string; time: string; duration: number }[]
    teacher: Teacher
    child: Child
  } | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 30)

  useEffect(() => {
    if (!teacherId || !user?.id) return
    Promise.all([
      teacherService.getById(teacherId),
      childService.getByParentId(user.id),
      bookingService.getByTeacherId(teacherId),
    ]).then(([t, c, bookings]) => {
      setTeacher(t as unknown as Teacher)
      setChildren(c as unknown as Child[])
      setExistingBookings((bookings as any[])
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .map(b => ({ date: b.date, time: b.time }))
      )
      setLoading(false)
    })
  }, [teacherId])

  const selectedChild = children.find((c) => c.id === selectedChildId)

  const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1).getDay()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [viewingYear, viewingMonth, daysInMonth, firstDayOfMonth])

  const canGoPrevMonth = () => {
    const current = new Date()
    return viewingYear > current.getFullYear() || viewingMonth > current.getMonth()
  }

  const canGoNextMonth = () => {
    const next = new Date(viewingYear, viewingMonth + 1, 1)
    return next <= maxDate
  }

  const handlePrevMonth = () => {
    if (!canGoPrevMonth()) return
    if (viewingMonth === 0) {
      setViewingMonth(11)
      setViewingYear(viewingYear - 1)
    } else {
      setViewingMonth(viewingMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (!canGoNextMonth()) return
    if (viewingMonth === 11) {
      setViewingMonth(0)
      setViewingYear(viewingYear + 1)
    } else {
      setViewingMonth(viewingMonth + 1)
    }
  }

  const dayNameFromDate = (day: number) => {
    const d = new Date(viewingYear, viewingMonth, day)
    return DAY_NAMES[d.getDay()]
  }

  const isDateSelectable = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d >= today && d <= maxDate
  }

  const datesWithSessions = new Set(sessions.map((s) => s.date))

  const selectDate = (dateStr: string) => {
    if (!isDateSelectable(dateStr)) return
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    )
    setActiveDate(dateStr)
    setSelectedTime('')
  }

  const addSessions = () => {
    if (!activeDate || !selectedTime || selectedDates.length === 0) return
    const newSessions: { date: string; time: string; duration: number }[] = []
    for (const date of selectedDates) {
      const key = `${date}|${selectedTime}`
      if (sessions.some((s) => `${s.date}|${s.time}` === key)) continue
      newSessions.push({ date, time: selectedTime, duration: parseInt(duration) })
    }
    if (newSessions.length === 0) return
    setSessions([...sessions, ...newSessions])
    setSelectedTime('')
  }

  const removeSession = (idx: number) => {
    setSessions(sessions.filter((_, i) => i !== idx))
  }

  const handleSubmitAll = async () => {
    if (!teacherId || !selectedChildId || sessions.length === 0) return
    const child = children.find((c) => c.id === selectedChildId) ?? preselectedChild
    const t = teacher
    if (!child || !t) return
    setSubmitting(true)
    try {
      await Promise.all(
        sessions.map((s) =>
          bookingService.create({
            teacherId,
            parentId: user!.id,
            childId: selectedChildId,
            date: s.date,
            time: s.time,
            duration: s.duration,
            sessionType: 'In-Person Tutoring',
            sessionMode,
            address: sessionMode === 'face-to-face' ? address : undefined,
          })
        )
      )
      setReceipt({ sessions, teacher: t, child })
      setStep(3)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit booking. Please try again.'
      alert(msg)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
        <User className="h-12 w-12" />
        <p>Teacher not found</p>
        <Button variant="outline" onClick={() => navigate('/parent/matching')}>
          Back to Matching
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-center gap-2">
        <Link
          to={`/parent/teacher/${teacherId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="mr-1 inline h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Book a Session</h1>
          <p className="text-sm text-gray-500">with {teacher.name}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Avatar className="h-8 w-8">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback>{teacher.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Select Your Child
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => { setSelectedChildId(child.id); setStep(2) }}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        selectedChildId === child.id
                          ? 'border-primary bg-primary-light/20'
                          : 'border-border hover:border-gray-300'
                      }`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={child.avatar} />
                        <AvatarFallback>{child.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-xs text-gray-500">
                          {child.age} years &middot; {child.grade}
                        </p>
                      </div>
                      {selectedChildId === child.id && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  Select Dates
                </CardTitle>
                <p className="text-xs text-gray-400">
                  Pick multiple dates &middot; Available within 30 days
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={handlePrevMonth} disabled={!canGoPrevMonth()}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-semibold">
                    {MONTH_NAMES[viewingMonth]} {viewingYear}
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleNextMonth} disabled={!canGoNextMonth()}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="py-1.5 font-medium text-gray-500">
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    if (day === null)
                      return <div key={`e-${i}`} />
                    const dateStr = `${viewingYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const dayName = dayNameFromDate(day)
                    const selectable = isDateSelectable(dateStr)
                    const isSelected = selectedDates.includes(dateStr)
                    const hasSession = datesWithSessions.has(dateStr)
                    return (
                      <button
                        key={day}
                        disabled={!selectable}
                        onClick={() => selectDate(dateStr)}
                        className={`relative rounded-lg py-2 text-sm transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : selectable
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'cursor-not-allowed text-gray-300'
                        }`}
                      >
                        {day}
                        {hasSession && (
                          <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Click dates to select &middot; Green dot = has bookings
                </p>
              </CardContent>
            </Card>

            {activeDate && (
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {new Date(activeDate + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                    <span className="text-xs text-gray-400">
                      {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const dayName = DAY_NAMES[new Date(activeDate + 'T12:00:00').getDay()]
                      const teacherHasAny = teacher!.availability && teacher!.availability.length > 0
                      const childHasAny = selectedChild?.schedule && selectedChild.schedule.length > 0
                      const teacherDaySlots = teacherHasAny ? generateTimeSlots(getDayAvailability(teacher!, dayName)) : []
                      const childDaySlots = childHasAny ? generateTimeSlots(getDayChildSchedule(selectedChild ?? null, dayName)) : []
                      // If neither has schedule, show all; if one has, use it; if both have, intersect
                      let slots: string[]
                      if (!teacherHasAny && !childHasAny) {
                        slots = [...TIME_SLOTS]
                      } else if (!teacherHasAny) {
                        slots = childDaySlots
                      } else if (!childHasAny) {
                        slots = teacherDaySlots
                      } else {
                        slots = teacherDaySlots.filter(t => childDaySlots.includes(t))
                      }
                      const bookedTimes = existingBookings.filter(b => b.date === activeDate).map(b => b.time)
                      const availableSlots = slots.filter(t => !bookedTimes.includes(t))
                      return availableSlots.length === 0 ? (
                        <p className="text-xs text-gray-400 py-2">No available time slots for this date.</p>
                      ) : availableSlots.map((time) => {
                        const alreadyAdded = sessions.some((s) => s.date === activeDate && s.time === time)
                        return (
                          <button
                            key={time}
                            disabled={alreadyAdded}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              selectedTime === time
                                ? 'border-primary bg-primary text-white'
                                : alreadyAdded
                                ? 'cursor-not-allowed border-green-200 bg-green-50 text-green-400'
                                : 'border-border hover:border-gray-300'
                            }`}
                          >
                            {time} {alreadyAdded && '✓'}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  {selectedTime && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-600">Duration</label>
                        <Select
                          options={durationOptions}
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={addSessions}
                        className="mt-4 gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Add to {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4 text-primary" />
                  Session Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSessionMode('online')}
                    className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      sessionMode === 'online' ? 'border-primary bg-primary-light/20 text-primary' : 'border-border text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="h-5 w-5" />
                    Online
                  </button>
                  <button
                    onClick={() => setSessionMode('face-to-face')}
                    className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      sessionMode === 'face-to-face' ? 'border-primary bg-primary-light/20 text-primary' : 'border-border text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    Face-to-Face
                  </button>
                </div>
                {sessionMode === 'face-to-face' && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address for the session"
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Sessions to Book ({sessions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sessions.map((s, idx) => (
                    <div
                      key={`${s.date}|${s.time}|${idx}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.time} &middot; {s.duration} min
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSession(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4 text-center">
                    <p className="mb-2 text-sm text-gray-500">
                      {sessions.length} session{sessions.length > 1 ? 's' : ''} &middot;{' '}
                      {sessions.reduce((sum, s) => sum + s.duration, 0)} min
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {sessions.length > 0 && (
              <Card className="border-2 border-primary/20">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold">Ready to submit?</p>
                    <p className="text-xs text-gray-500">
                      {sessions.length} session{sessions.length > 1 ? 's' : ''} will be sent for {teacher.name}'s approval
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSubmitAll}
                    disabled={submitting}
                    className="gap-2 px-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Submit
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {step === 3 && receipt && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-lg"
          >
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, delay: 0.2 }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                    <Clock3 className="h-10 w-10 text-amber-600" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-bold">Waiting for Approval</h2>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
                  <p className="text-sm text-gray-500">
                    {receipt.teacher.name} will review and confirm your sessions
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full space-y-3 rounded-xl bg-gray-50 p-4 text-left text-sm"
                >
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={receipt.teacher.avatar} />
                      <AvatarFallback>{receipt.teacher.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{receipt.teacher.name}</p>
                      <p className="text-xs text-gray-500">{receipt.teacher.subjects.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>

                    <div className="border-b border-border pb-2">
                      <p className="mb-2 text-xs font-semibold text-gray-500">Sessions</p>
                      {receipt.sessions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-1 text-sm">
                          <span>{new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="font-medium">{s.time} &middot; {s.duration}min</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Student</span>
                      <span className="font-medium">{receipt.child?.name ?? 'Unknown'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Mode</span>
                      <span className="font-medium capitalize">{sessionMode}</span>
                    </div>
                    {sessionMode === 'face-to-face' && address && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address</span>
                        <span className="font-medium text-right max-w-[200px] truncate">{address}</span>
                      </div>
                    )}

                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex w-full flex-col gap-2"
                >
                  <Button onClick={() => navigate('/parent/dashboard')}>
                    Back to Dashboard
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/parent/teacher/${teacherId}`)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
      )}

    </motion.div>
  )
}
