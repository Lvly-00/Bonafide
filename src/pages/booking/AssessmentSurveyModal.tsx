import { useState } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { assessmentService } from '@/services'
import type { AssessmentAnswer } from '@/types'

type SurveyType = 'parent' | 'teacher'

interface QuestionGroup {
  title: string
  questions: { id: number; text: string }[]
}

const parentGroups: QuestionGroup[] = [
  {
    title: 'Child Progress',
    questions: [
      { id: 1, text: 'My child was engaged throughout the session.' },
      { id: 2, text: 'My child understood the lesson discussed.' },
      { id: 3, text: 'My child appeared more confident after the session.' },
      { id: 4, text: 'My child showed interest in learning after the session.' },
      { id: 5, text: 'My child was able to apply what was learned at home.' },
    ],
  },
  {
    title: 'Teacher Performance',
    questions: [
      { id: 6, text: 'The teacher communicated clearly with my child.' },
      { id: 7, text: 'The teacher was patient and understanding.' },
      { id: 8, text: 'The teacher adapted the lesson to my child\'s learning needs.' },
      { id: 9, text: 'The teacher encouraged my child positively.' },
      { id: 10, text: 'The teacher managed the session effectively.' },
    ],
  },
  {
    title: 'Overall Experience',
    questions: [
      { id: 11, text: 'I am satisfied with today\'s session.' },
      { id: 12, text: 'I would like my child to continue learning with this teacher.' },
    ],
  },
]

const teacherGroups: QuestionGroup[] = [
  {
    title: 'Student Engagement',
    questions: [
      { id: 13, text: 'The student actively participated during the session.' },
      { id: 14, text: 'The student maintained attention throughout the lesson.' },
      { id: 15, text: 'The student completed the assigned activities.' },
      { id: 16, text: 'The student showed interest in learning.' },
      { id: 17, text: 'The student responded positively to the teaching strategies used.' },
    ],
  },
  {
    title: 'Learning Progress',
    questions: [
      { id: 18, text: 'The student understood today\'s lesson.' },
      { id: 19, text: 'The student demonstrated improvement compared to previous sessions.' },
      { id: 20, text: 'The student achieved today\'s learning objectives.' },
      { id: 21, text: 'The teaching strategies matched the student\'s learning needs.' },
      { id: 22, text: 'The student is ready for the next learning objective.' },
    ],
  },
  {
    title: 'Overall Session',
    questions: [
      { id: 23, text: 'The session was productive.' },
      { id: 24, text: 'I recommend continuing the current learning approach.' },
    ],
  },
]

const scaleLabels = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

interface AssessmentSurveyModalProps {
  childId: string
  onClose: () => void
}

export default function AssessmentSurveyModal({ childId, onClose }: AssessmentSurveyModalProps) {
  const [surveyType, setSurveyType] = useState<SurveyType>('parent')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const groups = surveyType === 'parent' ? parentGroups : teacherGroups
  const allQuestions = groups.flatMap((g) => g.questions)
  const answeredCount = allQuestions.filter((q) => answers[q.id] !== undefined).length
  const totalCount = allQuestions.length

  const setAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const payload: AssessmentAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer,
    }))
    try {
      await assessmentService.submitAnswers(childId, payload)
    } catch { /* ignore */ }
    if (surveyType === 'parent') {
      setSurveyType('teacher')
      setSubmitted(false)
      setSubmitting(false)
    } else {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  if (submitted) {
    return (
      <DialogContent onClose={onClose} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Survey Complete</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Thank you for your feedback!</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent onClose={onClose} className="max-w-xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Session Assessment</DialogTitle>
      </DialogHeader>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSurveyType('parent')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            surveyType === 'parent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Parent Survey
        </button>
        <button
          onClick={() => setSurveyType('teacher')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            surveyType === 'teacher' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Teacher Survey
        </button>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mb-4 text-xs text-gray-500">{answeredCount} of {totalCount} answered</p>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">{group.title}</h4>
            <div className="space-y-3">
              {group.questions.map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-xs leading-relaxed text-gray-600">{q.text}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAnswer(q.id, val)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                          answers[q.id] === val
                            ? 'bg-primary text-white scale-110'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={scaleLabels[val]}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <span key={val} className="text-[10px] text-gray-400">
              {val}={scaleLabels[val].split(' ').pop()}
            </span>
          ))}
        </div>
        <Button onClick={handleSubmit} disabled={answeredCount < totalCount || submitting}>
          {submitting ? 'Saving...' : surveyType === 'parent' ? 'Next (Teacher)' : 'Submit'}
        </Button>
      </div>
    </DialogContent>
  )
}
