import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, User, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { bookingService } from '@/services'
import type { Booking } from '@/types'

export default function TeacherApprovalsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    bookingService.getByTeacherId('teacher-1').then((data) => {
      setBookings(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: string) => {
    await bookingService.updateStatus(id, status)
    load()
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
                <div key={b.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.childId}`} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{b.childId.replace('child-', 'Student ')}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{b.date}</span>
                        <span>&middot;</span>
                        <span>{b.time}</span>
                        <span>&middot;</span>
                        <span>{b.sessionType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="success" onClick={() => handleStatus(b.id, 'confirmed')} className="h-8 px-3">
                      <Check className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleStatus(b.id, 'cancelled')} className="h-8 px-3">
                      <X className="h-3.5 w-3.5 mr-1" /> Decline
                    </Button>
                  </div>
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
                      <p className="font-medium">{b.childId.replace('child-', 'Student ')}</p>
                      <p className="text-xs text-gray-500">{b.date} &middot; {b.time} &middot; {b.sessionType}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Confirmed</Badge>
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
                      <p className="font-medium">{b.childId.replace('child-', 'Student ')}</p>
                      <p className="text-xs text-gray-500">{b.date} &middot; {b.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" size="sm">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
