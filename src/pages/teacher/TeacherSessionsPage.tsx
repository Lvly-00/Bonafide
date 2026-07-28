import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, User, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { teacherService } from '@/services'

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'default' | 'destructive'> = {
  scheduled: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

export default function TeacherSessionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  const bookedDates: Record<string, any[]> = {}

  if (data) {
    const weekSessions = data.upcomingWeek || []
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      const daySessions = weekSessions.find((w: any) => w.day === dayName)
      if (daySessions?.sessions?.length) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        bookedDates[key] = daySessions.sessions
      }
    }
  }

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const selectedSessions = selectedDate ? bookedDates[selectedDate] || [] : []

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">Click a date to see sessions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{monthName}</CardTitle>
            <div className="flex gap-1">
              <button
                onClick={() => { setMonthOffset(monthOffset - 1); setSelectedDate(null) }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setMonthOffset(0); setSelectedDate(null) }}
                className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => { setMonthOffset(monthOffset + 1); setSelectedDate(null) }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
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
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasSessions = !!bookedDates[key]
              const isSelected = selectedDate === key
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={`relative rounded-lg p-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-md scale-105'
                      : hasSessions
                        ? 'bg-primary-light/40 text-primary hover:bg-primary-light/60'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                  {hasSessions && (
                    <span className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Sessions on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedSessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-2 text-sm text-gray-400">
                  <Clock className="h-8 w-8" />
                  <p>No sessions on this day</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {selectedSessions.map((session: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-3.5 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(session.student || session.studentName || '').toLowerCase().replace(/\s+/g, '-')}`} />
                          <AvatarFallback>{(session.student || session.studentName || '?').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.student || session.studentName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {session.time}
                            <span>&middot; {session.subject}</span>
                            {session.duration && <span>&middot; {session.duration} min</span>}
                          </div>
                        </div>
                      </div>
                      <Badge variant={statusVariant[session.status] || 'secondary'} size="sm">
                        {session.status || 'scheduled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
