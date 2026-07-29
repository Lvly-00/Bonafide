import api from './api'
import type { Notification } from '@/types'

export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const { data } = await api.get('/notifications', { params: { userId } })
    return data
  },

  async create(notification: { userId: string; title: string; message: string; type: string; link?: string }): Promise<Notification> {
    const { data } = await api.post('/notifications', notification)
    return data
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(userId: string): Promise<void> {
    await api.patch('/notifications/read-all', { userId })
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data } = await api.get('/notifications', { params: { userId } })
    return data.filter((n: Notification) => !n.read).length
  },
}
