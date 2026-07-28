import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { teacherService } from '@/services'

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TeacherCalendarPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)

  useEffect(() => {
    teacherService.getDashboardData('teacher-1').then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  const weekSessions = data.upcomingWeek || []

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
              const date = new Date(year, month, day)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
              const daySessions = weekSessions.find((w: any) => w.day === dayName)
              const hasSessions = daySessions?.sessions?.length > 0
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
                      {daySessions.sessions.map((s: any, si: number) => (
                        <div key={si} className="truncate rounded bg-white px-1 py-0.5 text-[10px] shadow-sm">
                          {s.time}
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
            Upcoming This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weekSessions.flatMap((d: any) => d.sessions).length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No sessions this week</p>
          ) : (
            weekSessions.map((d: any) =>
              d.sessions.length > 0 && (
                <div key={d.day}>
                  <p className="mb-1.5 text-xs font-semibold text-gray-500">{d.day}</p>
                  <div className="space-y-1.5">
                    {d.sessions.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                          {s.time}
                        </div>
                        <div>
                          <p className="font-medium">{s.student}</p>
                          <p className="text-xs text-gray-500">{s.subject}</p>
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
