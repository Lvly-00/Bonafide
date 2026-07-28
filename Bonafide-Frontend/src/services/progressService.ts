import api from './api'
import type { ProgressData, LearningPassport } from '@/types'

export const progressService = {
  async getByChildId(childId: string): Promise<ProgressData[]> {
    const { data } = await api.get(`/progress/${childId}`)
    return data
  },

  async getLearningPassport(childId: string): Promise<LearningPassport | null> {
    const { data } = await api.get(`/progress/${childId}/passport`)
    return data
  },
}
