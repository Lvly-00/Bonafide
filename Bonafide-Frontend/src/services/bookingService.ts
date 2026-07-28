import api from './api'
import type { Booking, AssessmentAnswer } from '@/types'

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const { data } = await api.get('/bookings')
    return data
  },

  async getByParentId(parentId: string): Promise<Booking[]> {
    const { data } = await api.get('/bookings', { params: { parent_id: parentId } })
    return data
  },

  async getByTeacherId(teacherId: string): Promise<Booking[]> {
    const { data } = await api.get('/bookings', { params: { teacher_id: teacherId } })
    return data
  },

  async getById(id: string): Promise<Booking | null> {
    const { data } = await api.get(`/bookings/${id}`)
    return data
  },

  async create(data: Partial<Booking>): Promise<Booking> {
    const { data: res } = await api.post('/bookings', data)
    return res
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`)
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await api.patch(`/bookings/${id}/status`, { status })
  },

  async submitFeedback(id: string, role: 'parent' | 'teacher', answers: AssessmentAnswer[]): Promise<void> {
    await api.post(`/bookings/${id}/feedback`, { role, answers })
  },
}
