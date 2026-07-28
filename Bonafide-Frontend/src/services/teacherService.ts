import api from './api'
import type { Teacher, Review } from '@/types'

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    const { data } = await api.get('/teachers')
    return data
  },

  async getById(id: string): Promise<Teacher | null> {
    const { data } = await api.get(`/teachers/${id}`)
    return data
  },

  async getReviews(teacherId: string): Promise<Review[]> {
    const { data } = await api.get(`/teachers/${teacherId}/reviews`)
    return data
  },

  async getDashboardData(teacherId: string): Promise<any> {
    const { data } = await api.get('/dashboard/teacher', { params: { teacherId } })
    return data
  },

  async updateAvailability(availability: { day: string; slots: { start: string; end: string }[] }[]): Promise<any> {
    const { data } = await api.patch('/teachers/availability', { availability })
    return data
  },

  async getAvailability(): Promise<any> {
    const { data } = await api.get('/teachers/availability')
    return data
  },

  async getFavorites(): Promise<string[]> {
    const { data } = await api.get('/favorites')
    return data
  },

  async favorite(teacherId: string): Promise<void> {
    await api.post(`/teachers/${teacherId}/favorite`)
  },

  async unfavorite(teacherId: string): Promise<void> {
    await api.delete(`/teachers/${teacherId}/favorite`)
  },
}
