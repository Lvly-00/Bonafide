import { mockAssessments, assessmentQuestions } from '@/data/assessments'
import type { Assessment, AssessmentAnswer } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const assessmentService = {
  async getByChildId(childId: string): Promise<Assessment | null> {
    await delay(400)
    return (mockAssessments.find(a => a.childId === childId) as unknown as Assessment) || null
  },

  async getQuestions(): Promise<typeof assessmentQuestions> {
    await delay(300)
    return assessmentQuestions
  },

  async submitAnswers(childId: string, answers: AssessmentAnswer[]): Promise<Assessment> {
    await delay(2000)
    const existing = mockAssessments.find(a => a.childId === childId)
    if (existing) {
      return { ...existing, answers, progress: 100, status: 'completed' } as unknown as Assessment
    }
    return {
      id: `assessment-${Date.now()}`,
      childId,
      status: 'completed',
      answers,
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: {
        learningProfile: { type: 'Kinesthetic Learner', description: 'Hands-on learning style detected.' },
        strengths: ['Problem Solving', 'Creativity'],
        weaknesses: ['Reading Comprehension'],
        recommendations: ['Use hands-on materials', 'Take movement breaks'],
        recommendedTeachers: ['teacher-1', 'teacher-3'],
        scores: [
          { category: 'Logical Reasoning', score: 85 },
          { category: 'Reading Comprehension', score: 55 },
          { category: 'Creativity', score: 90 },
          { category: 'Problem Solving', score: 88 },
        ],
      },
    } as unknown as Assessment
  },

  async saveProgress(childId: string, answers: AssessmentAnswer[], progress: number): Promise<void> {
    await delay(400)
  },
}
