import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  MessageSquare,
  Star,
  Bell,
  AlertCircle,
  Trash2,
  CheckCheck,
  Clock,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification } from '@/types'

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  booking: { icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
  message: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
  system: { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
  reminder: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function groupNotifications(notifications: Notification[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 86400000)

  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Older', items: [] },
  ]

  notifications.forEach((n) => {
    const d = new Date(n.createdAt)
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (dDate.getTime() === today.getTime()) groups[0].items.push(n)
    else if (dDate.getTime() === yesterday.getTime()) groups[1].items.push(n)
    else if (dDate >= thisWeekStart) groups[2].items.push(n)
    else groups[3].items.push(n)
  })

  return groups.filter((g) => g.items.length > 0)
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const groups = groupNotifications(notifications)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Inbox className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            You're all up to date. Check back later!
          </p>
        </motion.div>
      ) : (
        groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-500">{group.label}</h3>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {group.items.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.system
                  const Icon = config.icon
                  const isHovered = hoveredId === notification.id

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      onMouseEnter={() => setHoveredId(notification.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-all ${
                        notification.read
                          ? 'border-border bg-white'
                          : 'border-blue-200 bg-blue-50/50'
                      }`}
                    >
                      <div className={`rounded-full p-2.5 ${config.bg} ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-sm ${
                                notification.read ? 'font-normal' : 'font-semibold'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-gray-400">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`absolute right-2 top-2 flex gap-1 transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-gray-400 hover:text-blue-600"
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-500"
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}
    </motion.div>
  )
}
