import api from './api'
import type { Assessment, AssessmentAnswer } from '@/types'

export const assessmentService = {
  async getByChildId(childId: string): Promise<Assessment | null> {
    const { data } = await api.get(`/assessments/${childId}`)
    return data
  },

  async getQuestions(): Promise<any[]> {
    const { data } = await api.get('/assessment-questions')
    return data
  },

  async submitAnswers(childId: string, answers: AssessmentAnswer[]): Promise<Assessment> {
    const { data } = await api.post(`/assessments/${childId}/submit`, { answers })
    return data
  },

  async saveProgress(childId: string, answers: AssessmentAnswer[], progress: number): Promise<void> {
    await api.post(`/assessments/${childId}/progress`, { answers, progress })
  },
}
