import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  Sparkles,
  Camera,
  Check,
  Upload,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { childService, teacherService } from '@/services'
import { LEARNING_STYLES, LEARNING_CONCERNS, GRADES, ROUTES } from '@/constants'
import type { Teacher } from '@/types'

interface ChildForm {
  name: string
  age: string
  grade: string
  interests: string[]
  learningConcerns: string[]
  strengths: string[]
  learningStyle: string
  avatar: string
}

const initialForm: ChildForm = {
  name: '',
  age: '',
  grade: '',
  interests: [],
  learningConcerns: [],
  strengths: [],
  learningStyle: '',
  avatar: '',
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
}

function findBestMatch(teachers: Teacher[], child: ChildForm): Teacher {
  const childInterests = child.interests.map((i) => i.toLowerCase())
  const childConcerns = child.learningConcerns.map((c) => c.toLowerCase())

  const scored = teachers.map((teacher) => {
    let score = 0
    const teacherSubjects = teacher.subjects.map((s) => s.toLowerCase())
    const teacherSpec = teacher.specialization.map((s) => s.toLowerCase())

    const subjectOverlap = childInterests.filter((i) =>
      teacherSubjects.some((s) => s.includes(i) || i.includes(s))
    ).length
    score += subjectOverlap * 15

    const specOverlap = childInterests.filter((i) =>
      teacherSpec.some((s) => s.includes(i) || i.includes(s))
    ).length
    score += specOverlap * 10

    const learningStyleMap: Record<string, string[]> = {
      Visual: ['Art', 'Drawing', 'Design'],
      Auditory: ['Music', 'Language'],
      'Reading/Writing': ['English', 'Literature', 'History'],
      Kinesthetic: ['Sports', 'Building', 'Science'],
    }
    const matchingSubjects = learningStyleMap[child.learningStyle] || []
    const styleMatch = teacherSubjects.some((s) =>
      matchingSubjects.some((m) => s.includes(m.toLowerCase()))
    )
    if (styleMatch) score += 10

    score += teacher.rating * 5
    score += Math.min(teacher.experience, 10)

    if (childConcerns.some((c) => c.includes('focus') || c.includes('adhd'))) {
      if (teacher.bio.toLowerCase().includes('patient') || teacher.bio.toLowerCase().includes('focus')) score += 5
    }

    return { teacher, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.teacher || teachers[0]
}

const matchingMessages = [
  'Analyzing learning profile...',
  'Scanning teacher expertise...',
  'Checking compatibility metrics...',
  'Evaluating teaching styles...',
  'Finding the perfect match...',
]

export default function AddChildWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<ChildForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [matchMessageIdx, setMatchMessageIdx] = useState(0)

  useEffect(() => {
    teacherService.getAll().then(setTeachers)
  }, [])

  useEffect(() => {
    if (!matching) return
    const msgInterval = setInterval(() => {
      setMatchMessageIdx((prev) => (prev + 1) % matchingMessages.length)
    }, 1200)
    return () => clearInterval(msgInterval)
  }, [matching])

  const updateField = <K extends keyof ChildForm>(key: K, value: ChildForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayItem = (key: 'interests' | 'learningConcerns' | 'strengths', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => updateField('avatar', reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1: return form.name.trim() && form.age && form.grade
      case 2: return true
      case 3: return !!form.learningStyle
      case 4: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const payload = { ...form, age: Number(form.age), profileCompleted: true }
    await childService.create(payload)
    setSubmitting(false)
    setDirection(1)
    setStep(6)
    startMatching()
  }

  const startMatching = useCallback(async () => {
    setMatching(true)
    await new Promise((r) => setTimeout(r, 3000))
    setMatching(false)
    navigate(ROUTES.PARENT_DASHBOARD)
  }, [navigate])

  const goNext = () => {
    if (step < 4) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const goPrev = () => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const formSteps = (
    <>
      <div className="mb-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="h-4 w-4" /> Basic Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
                    <Input
                      placeholder="Child's full name"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Age</label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={form.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Grade</label>
                  <Select
                    value={form.grade}
                    onChange={(e) => updateField('grade', e.target.value)}
                    options={GRADES.map((g) => ({ value: g, label: g }))}
                    placeholder="Select grade"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Space', 'Dinosaurs', 'Building', 'Reading', 'Art', 'Music', 'Sports', 'Science', 'Coding', 'Animals'].map(
                      (interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleArrayItem('interests', interest)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            form.interests.includes(interest)
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-border text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {interest}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <AlertTriangle className="h-4 w-4" /> Learning Concerns
                  </h3>
                  <p className="mb-3 text-xs text-gray-500">Select any concerns your child may have</p>
                  <div className="flex flex-wrap gap-2">
                    {(LEARNING_CONCERNS.filter((c) => c !== 'None') as string[]).concat('None').map((concern) => (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => toggleArrayItem('learningConcerns', concern)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            form.learningConcerns.includes(concern)
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-border text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {concern}
                        </button>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Sparkles className="h-4 w-4" /> Strengths
                  </h3>
                  <p className="mb-3 text-xs text-gray-500">Select your child's key strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Creative Thinking',
                      'Problem Solving',
                      'Writing',
                      'Art',
                      'Leadership',
                      'Teamwork',
                      'Communication',
                      'Organization',
                      'Memory',
                      'Curiosity',
                      'Persistence',
                      'Math Skills',
                    ].map((strength) => (
                      <button
                        key={strength}
                        type="button"
                        onClick={() => toggleArrayItem('strengths', strength)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          form.strengths.includes(strength)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-border text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {strength}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Sparkles className="h-4 w-4" /> Learning Style
                </h3>
                <p className="text-xs text-gray-500">How does your child learn best?</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEARNING_STYLES.map((style) => {
                    const descriptions: Record<string, string> = {
                      Visual: 'Learns through images, diagrams, and spatial understanding',
                      Auditory: 'Learns through listening and verbal instruction',
                      'Reading/Writing': 'Learns through text-based input and writing',
                      Kinesthetic: 'Learns through hands-on activities and movement',
                    }
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateField('learningStyle', style)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          form.learningStyle === style
                            ? 'border-primary bg-primary-light ring-1 ring-primary'
                            : 'border-border hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-semibold">{style}</p>
                        <p className="mt-1 text-xs text-gray-500">{descriptions[style]}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Camera className="h-4 w-4" /> Profile Picture
                </h3>
                <p className="text-xs text-gray-500">Upload a photo of your child</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-28 w-28">
                      {form.avatar ? (
                        <AvatarImage src={form.avatar} alt="Preview" />
                      ) : (
                        <AvatarFallback className="text-3xl">
                          {form.name ? form.name[0].toUpperCase() : '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Choose Photo
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t pt-5">
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={goPrev}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step < 4 ? (
            <Button size="sm" onClick={goNext} disabled={!isStepValid()}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={!isStepValid() || submitting}>
              {submitting ? (
                'Saving...'
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" /> Complete Profile
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  )

  const matchingScreen = (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-8">
        <motion.div
          className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <GraduationCap className="h-10 w-10 text-primary" />
        </motion.div>
      </div>

      <motion.h3
        key={matchMessageIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-gray-700"
      >
        {matchingMessages[matchMessageIdx]}
      </motion.h3>

      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">This may take a few seconds...</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Add Your Child</h1>
        <p className="text-sm text-gray-500">
          {step <= 4
            ? 'Create a learning profile and get matched with the perfect tutor'
            : 'Finding the ideal teacher...'}
        </p>
      </div>

      {step <= 4 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {step === 1 ? 'Basic Info' : step === 2 ? 'Concerns & Strengths' : step === 3 ? 'Learning Style' : 'Photo'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-gray-500">Step {step}/4</span>
            </div>
          </CardHeader>
          <CardContent>{formSteps}</CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardContent>{matchingScreen}</CardContent>
        </Card>
      )}
    </motion.div>
  )
}
