import { useEffect } from 'react'
import { useNotificationStore } from '@/stores/notificationStore'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'

export function useNotifications() {
  const { notifications, unreadCount, setNotifications, setUnreadCount, markAsRead } = useNotificationStore()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user) {
      notificationService.getByUserId(user.id).then(setNotifications)
      notificationService.getUnreadCount(user.id).then(setUnreadCount)
    }
  }, [user, setNotifications, setUnreadCount])

  const markAsReadHandler = async (id: string) => {
    await notificationService.markAsRead(id)
    markAsRead(id)
  }

  const markAllAsRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.id)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const deleteNotification = async (id: string) => {
    await notificationService.delete(id)
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return {
    notifications,
    unreadCount,
    markAsRead: markAsReadHandler,
    markAllAsRead,
    deleteNotification,
  }
}
