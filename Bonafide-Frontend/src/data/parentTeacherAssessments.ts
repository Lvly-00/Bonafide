import { mockAssessments, assessmentQuestions } from '@/data/assessments'

export interface ParentTeacherAssessmentAnswer {
  questionId: number
  answer: string | number
}

export interface ParentTeacherAssessment {
  id: string
  studentId: string
  type: 'parent' | 'teacher'
  answers: ParentTeacherAssessmentAnswer[]
  overallScore?: number
  feedback?: string
  submittedAt: string
}

export interface ParentTeacherAssessmentQuestion {
  id: number
  question: string
  category: 'Child Progress' | 'Teacher Performance' | 'Overall Experience'
  type: 'scale'
  options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
}

const parentTeacherAssessmentQuestions: ParentTeacherAssessmentQuestion[] = [
  { id: 1, question: 'My child was engaged throughout the session.', category: 'Child Progress', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 2, question: 'My child understood the lesson discussed.', category: 'Child Progress', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 3, question: 'My child appeared more confident after the session.', category: 'Child Progress', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 4, question: 'My child showed interest in learning after the session.', category: 'Child Progress', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 5, question: 'My child was able to apply what was learned at home.', category: 'Child Progress', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 6, question: 'The teacher communicated clearly with my child.', category: 'Teacher Performance', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 7, question: 'The teacher was patient and understanding.', category: 'Teacher Performance', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 8, question: 'The teacher adapted the lesson to my child\'s learning needs.', category: 'Teacher Performance', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 9, question: 'The teacher encouraged my child positively.', category: 'Teacher Performance', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 10, question: 'The teacher managed the session effectively.', category: 'Teacher Performance', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 11, question: 'I am satisfied with today\'s session.', category: 'Overall Experience', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { id: 12, question: 'I would like my child to continue learning with this teacher.', category: 'Overall Experience', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
]

export default parentTeacherAssessmentQuestions
