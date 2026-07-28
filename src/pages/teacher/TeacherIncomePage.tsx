import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, ArrowUpRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { teacherService } from '@/services'

export default function TeacherIncomePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teacherService.getDashboardData('teacher-1').then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const { stats, recentEarnings } = data

  const summaryCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue || '0'}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
    { label: 'Avg. per Session', value: `$${Math.round((stats.totalRevenue || 0) / (stats.totalSessions || 1))}`, icon: ArrowUpRight, color: 'text-purple-600 bg-purple-100' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Income</h1>
        <p className="text-sm text-gray-500 mt-1">Track your earnings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentEarnings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-2 text-sm text-gray-400">
              <DollarSign className="h-8 w-8" />
              <p>No earnings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentEarnings.map((earning: any) => (
                <div key={earning.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${earning.student.toLowerCase().replace(/\s+/g, '-')}`} />
                      <AvatarFallback>{earning.student.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{earning.student}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {earning.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${earning.amount}</p>
                    <Badge variant={earning.status === 'completed' ? 'success' : 'secondary'} size="sm">
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Monthly Total</p>
              <p className="text-xs text-gray-500 mt-0.5">Current month earnings</p>
            </div>
            <p className="text-3xl font-bold text-primary">${stats.monthlyRevenue || '0'}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
