import api from './api'
import type { Booking, AssessmentAnswer, AssessmentResult } from '@/types'
import type { ParentTeacherAssessment } from '@/types'

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

  async getSessionAssessments(childId: string): Promise<any[]> {
    const { data } = await api.get(`/bookings/session-assessments/${childId}`)
    return data
  },

  async submitParentFeedback(bookingId: string, answers: any[]): Promise<void> {
    await api.post(`/bookings/${bookingId}/parent-feedback`, { answers })
  },

  async submitTeacherAssessment(bookingId: string, answers: any[]): Promise<void> {
    await api.post(`/bookings/${bookingId}/teacher-assessment`, { answers })
  },

  async getParentFeedback(bookingId: string): Promise<any | null> {
    const { data } = await api.get(`/bookings/${bookingId}/parent-feedback`)
    return data
  },

  async getTeacherAssessment(bookingId: string): Promise<any | null> {
    const { data } = await api.get(`/bookings/${bookingId}/teacher-assessment`)
    return data
  },

  async getParentFeedbackByChildId(childId: string): Promise<any | null> {
    try {
      const { data } = await api.get(`/bookings/parent-feedback/${childId}`)
      return data
    } catch {
      return null
    }
  },
}
