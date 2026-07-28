import { mockProgressData, mockLearningPassport } from '@/data/progress'
import type { ProgressData, LearningPassport } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const progressService = {
  async getByChildId(childId: string): Promise<ProgressData[]> {
    await delay(500)
    return mockProgressData.filter(p => p.childId === childId) as unknown as ProgressData[]
  },

  async getLearningPassport(childId: string): Promise<LearningPassport | null> {
    await delay(400)
    if (mockLearningPassport.childId === childId) {
      return mockLearningPassport as unknown as LearningPassport
    }
    return null
  },
}
