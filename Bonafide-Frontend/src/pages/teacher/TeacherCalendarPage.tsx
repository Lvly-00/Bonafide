import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { bookingService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Booking } from '@/types'

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TeacherCalendarPage() {
  const user = useAuthStore((s) => s.user)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    bookingService.getByTeacherId(user.id).then((data: Booking[]) => {
      setBookings(data.filter(b => b.status === 'confirmed' || b.status === 'completed'))
      setLoading(false)
    })
  }, [user])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b => b.date === dateStr)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const isPast = (date: string, time: string, duration: number) => {
    const [h, m] = time.split(':').map(Number)
    const start = new Date(date)
    start.setHours(h, m, 0, 0)
    return new Date() >= new Date(start.getTime() + duration * 60000)
  }

  const weekSessions = weekDayNames.map(dayName => ({
    day: dayName,
    sessions: bookings.filter(b => {
      const d = new Date(b.date + 'T12:00:00')
      return d.toLocaleDateString('en-US', { weekday: 'long' }) === dayName &&
        new Date(b.date + 'T12:00:00') <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }).map(b => ({ ...b, past: isPast(b.date, b.time, b.duration) }))
  }))

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">Your teaching schedule</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              {monthName}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setMonthOffset(monthOffset - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMonthOffset(0)}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMonthOffset(monthOffset + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="py-1.5 font-medium text-gray-500">{d}</div>
            ))}
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />
              const dayBookings = getBookingsForDay(day)
              const hasSessions = dayBookings.length > 0
              return (
                <div
                  key={day}
                  className={`rounded-lg p-2 text-sm ${
                    hasSessions ? 'bg-primary-light/50 font-medium text-primary' : 'text-gray-700'
                  }`}
                >
                  {day}
                  {hasSessions && (
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.map((b) => (
                        <div key={b.id} className="truncate rounded bg-white px-1 py-0.5 text-[10px] shadow-sm">
                          {b.time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            This Week's Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weekSessions.every((d: any) => d.sessions.length === 0) ? (
            <p className="py-4 text-center text-sm text-gray-400">No sessions this week</p>
          ) : (
            weekSessions.map((d: any) =>
              d.sessions.length > 0 && (
                <div key={d.day}>
                  <p className="mb-1.5 text-xs font-semibold text-gray-500">{d.day}</p>
                  <div className="space-y-1.5">
                    {d.sessions.map((s: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${s.past ? 'border-gray-100 opacity-60' : 'border-border'}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${s.past ? 'bg-gray-100 text-gray-400' : 'bg-primary-light text-primary'}`}>
                          {s.time}
                        </div>
                        <div>
                          <p className="font-medium">{s.student}</p>
                          <p className="text-xs text-gray-500">{s.subject}{s.past ? ' • Completed' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
