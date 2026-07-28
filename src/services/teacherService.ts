import { mockUsers } from '@/data/users'
import { mockReviews } from '@/data/reviews'
import { teacherDashboardData } from '@/data/dashboard'
import type { Teacher, Review } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    await delay(600)
    return mockUsers.filter(u => u.role === 'teacher') as unknown as Teacher[]
  },

  async getById(id: string): Promise<Teacher | null> {
    await delay(400)
    const teacher = mockUsers.find(u => u.id === id && u.role === 'teacher')
    return (teacher as unknown as Teacher) || null
  },

  async getReviews(teacherId: string): Promise<Review[]> {
    await delay(300)
    return mockReviews.filter(r => r.teacherId === teacherId)
  },

  async getDashboardData(teacherId: string): Promise<any> {
    await delay(500)
    return { ...teacherDashboardData, teacherId }
  },
}
