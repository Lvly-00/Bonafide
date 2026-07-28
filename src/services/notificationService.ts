import { mockNotifications } from '@/data/notifications'
import type { Notification } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    await delay(400)
    return mockNotifications.filter(n => n.userId === userId) as unknown as Notification[]
  },

  async markAsRead(id: string): Promise<void> {
    await delay(200)
  },

  async markAllAsRead(userId: string): Promise<void> {
    await delay(300)
  },

  async delete(id: string): Promise<void> {
    await delay(200)
  },

  async getUnreadCount(userId: string): Promise<number> {
    await delay(200)
    return mockNotifications.filter(n => n.userId === userId && !n.read).length
  },
}
