import api from './api'
import type { Child } from '@/types'

export const childService = {
  async getByParentId(parentId: string): Promise<Child[]> {
    const { data } = await api.get('/children', { params: { parent_id: parentId } })
    return data
  },

  async getById(id: string): Promise<Child> {
    const { data } = await api.get(`/children/${id}`)
    return data
  },

  async create(data: Partial<Child>): Promise<Child> {
    const { data: res } = await api.post('/children', data)
    return res
  },

  async update(id: string, data: Partial<Child>): Promise<Child> {
    const { data: res } = await api.put(`/children/${id}`, data)
    return res
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/children/${id}`)
  },

  async getRecommendedTeachers(childId: string): Promise<any[]> {
    const { data } = await api.get(`/children/${childId}/recommended-teachers`)
    return data
  },

  async getLearningProfile(childId: string): Promise<any> {
    const { data } = await api.get(`/children/${childId}/learning-profile`)
    return data
  },
}
