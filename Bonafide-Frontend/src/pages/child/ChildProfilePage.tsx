import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  User,
  AlertTriangle,
  Sparkles,
  Calendar,
  Camera,
  Check,
  Plus,
  Upload,
  X,
  Pencil,
  Trash2,
  Search,
  Clock,
  BookOpen,
  Brain,
  Star,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { childService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import {
  LEARNING_STYLES,
  LEARNING_CONCERNS,
  GRADES,
  DAYS,
  TIME_SLOTS,
  ROUTES,
} from '@/constants'
import type { Child, MatchResult } from '@/types'

interface ChildForm {
  name: string
  age: string
  grade: string
  interests: string[]
  learningConcerns: string[]
  strengths: string[]
  learningStyle: string
  schedule: { day: string; timeSlots: { start: string; end: string }[] }[]
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
  schedule: [],
  avatar: '',
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
}

export default function ChildProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [children, setChildren] = useState<Child[]>([])
  const [editingChild, setEditingChild] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<ChildForm>(initialForm)
  const [recommendedTeachers, setRecommendedTeachers] = useState<Record<string, MatchResult[]>>({})
  const [loadingTeachers, setLoadingTeachers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user?.id) return
    childService.getByParentId(user.id).then((data) => {
      setChildren(data)
      // Fetch recommended teachers for each child
      data.forEach((child) => {
        setLoadingTeachers((prev) => ({ ...prev, [child.id]: true }))
        childService.getRecommendedTeachers(child.id).then((teachers) => {
          setRecommendedTeachers((prev) => ({ ...prev, [child.id]: teachers }))
          setLoadingTeachers((prev) => ({ ...prev, [child.id]: false }))
        }).catch(() => {
          setRecommendedTeachers((prev) => ({ ...prev, [child.id]: [] }))
          setLoadingTeachers((prev) => ({ ...prev, [child.id]: false }))
        })
      })
    })
  }, [user])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this child profile?')) {
      childService.delete(id).then(() => {
        setChildren((prev) => prev.filter((c) => c.id !== id))
        if (editingChild === id) resetForm()
      })
    }
  }

  const handleEdit = (child: Child, e: React.MouseEvent) => {
    e.stopPropagation()
    loadChild(child)
  }

  const loadChild = (child: Child) => {
    setEditingChild(child.id)
    setForm({
      name: child.name || '',
      age: String(child.age || ''),
      grade: child.grade || '',
      interests: child.interests || [],
      learningConcerns: child.learningConcerns || [],
      strengths: child.strengths || [],
      learningStyle: child.learningStyle || '',
      schedule: child.schedule || [],
      avatar: child.avatar || '',
    })
    setStep(1)
  }

  const resetForm = () => {
    setEditingChild(null)
    setForm(initialForm)
    setStep(1)
  }

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

  const addScheduleSlot = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'Monday', timeSlots: [{ start: '16:00', end: '17:00' }] }],
    }))
  }

  const updateScheduleDay = (idx: number, day: string) => {
    setForm((prev) => {
      const s = [...prev.schedule]
      s[idx] = { ...s[idx], day }
      return { ...prev, schedule: s }
    })
  }

  const updateScheduleTime = (idx: number, slotIdx: number, field: 'start' | 'end', value: string) => {
    setForm((prev) => {
      const s = [...prev.schedule]
      const slots = [...s[idx].timeSlots]
      slots[slotIdx] = { ...slots[slotIdx], [field]: value }
      s[idx] = { ...s[idx], timeSlots: slots }
      return { ...prev, schedule: s }
    })
  }

  const removeScheduleSlot = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx),
    }))
  }

  const handleSaveDraft = () => {
    childService
      .update(editingChild || `draft-${Date.now()}`, { ...form, age: Number(form.age), profileCompleted: step === 5 })
      .then(() => {
        if (!editingChild) resetForm()
      })
  }

  const handleSubmit = () => {
    const payload = { ...form, age: Number(form.age), profileCompleted: true }
    if (editingChild) {
      childService.update(editingChild, payload).then(resetForm)
    } else {
      childService.create(payload).then(resetForm)
    }
  }

  const goNext = () => {
    if (step < 5) {
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
      case 4: return form.schedule.length > 0
      case 5: return true
      default: return false
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Child Profile</h1>
        <p className="text-sm text-gray-500">Create or edit your child's learning profile</p>
      </div>

      {children.length > 0 && !editingChild && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card className="group h-full transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={child.avatar} alt={child.name} />
                      <AvatarFallback className="text-lg">{child.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold">{child.name}</p>
                          <p className="text-xs text-gray-500">
                            {child.age} yrs &middot; {child.grade}
                          </p>
                        </div>
                        {child.profileCompleted ? (
                          <Badge variant="success" className="shrink-0 text-[10px]">Completed</Badge>
                        ) : (
                          <Badge variant="warning" className="shrink-0 text-[10px]">Incomplete</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-3">
                    {child.learningStyle && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <span>{child.learningStyle} learner</span>
                      </div>
                    )}

                    {child.interests.length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-gray-500">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {child.interests.slice(0, 4).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-[10px]">
                              {interest}
                            </Badge>
                          ))}
                          {child.interests.length > 4 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{child.interests.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {child.strengths.length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-gray-500">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {child.strengths.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
                            >
                              {s}
                            </span>
                          ))}
                          {child.strengths.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                              +{child.strengths.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {child.schedule.length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-gray-500">Schedule</p>
                        <div className="flex flex-wrap gap-1">
                          {child.schedule.slice(0, 3).map((s, si) => (
                            <span
                              key={`${s.day}-${si}`}
                              className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600"
                            >
                              <Clock className="h-3 w-3" />
                              {s.day.slice(0, 3)} {s.timeSlots[0]?.start}
                            </span>
                          ))}
                          {child.schedule.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
                              +{child.schedule.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {loadingTeachers[child.id] ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  ) : recommendedTeachers[child.id]?.length > 0 ? (
                    <div>
                      <p className="mb-2 text-[11px] font-medium text-gray-500">Recommended Teachers</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {recommendedTeachers[child.id].slice(0, 4).map((teacher) => (
                          <div
                            key={teacher.teacherId}
                            className="flex shrink-0 flex-col items-center gap-1 rounded-lg border bg-gray-50 p-2.5 text-center"
                            style={{ minWidth: 120 }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={teacher.avatar} alt={teacher.name} />
                              <AvatarFallback className="text-xs">{teacher.name[0]}</AvatarFallback>
                            </Avatar>
                            <p className="max-w-[100px] truncate text-[10px] font-medium">{teacher.name}</p>
                            <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{teacher.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-green-600">${teacher.hourlyRate}/hr</p>
                            <Button
                              size="sm"
                              className="mt-1 h-6 w-full gap-1 px-2 text-[10px]"
                              onClick={() => navigate(`/parent/booking/${teacher.teacherId}`, { state: { preselectedChild: child } })}
                            >
                              Book Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={(e) => handleEdit(child, e)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs text-primary hover:text-primary"
                      onClick={() => navigate(ROUTES.MATCHING)}
                    >
                      <Search className="h-3.5 w-3.5" /> Find Tutor
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-gray-400 hover:text-red-500"
                      onClick={(e) => handleDelete(child.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="flex h-full cursor-pointer items-center justify-center border-2 border-dashed py-12 transition-shadow hover:shadow-md"
              onClick={() => navigate(ROUTES.CHILD_PROFILE_NEW)}
            >
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="rounded-full bg-gray-100 p-3">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Add New Child</span>
                <span className="text-xs text-gray-400">Create a learning profile</span>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {(editingChild || children.length === 0) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {editingChild ? 'Edit Profile' : 'New Profile'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-gray-500">Step {step}/5</span>
            </div>
          </CardHeader>
          <CardContent>
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
                      <p className="text-xs text-gray-500">
                        How does your child learn best?
                      </p>
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
                        <Calendar className="h-4 w-4" /> Schedule
                      </h3>
                      <p className="text-xs text-gray-500">
                        Add available days and time slots for sessions
                      </p>
                      {form.schedule.map((slot, idx) => (
                        <div key={idx} className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
                          <div className="min-w-[140px]">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Day</label>
                            <Select
                              value={slot.day}
                              onChange={(e) => updateScheduleDay(idx, e.target.value)}
                              options={DAYS.map((d) => ({ value: d, label: d }))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Start</label>
                            <Select
                              value={slot.timeSlots[0]?.start || ''}
                              onChange={(e) => updateScheduleTime(idx, 0, 'start', e.target.value)}
                              options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">End</label>
                            <Select
                              value={slot.timeSlots[0]?.end || ''}
                              onChange={(e) => updateScheduleTime(idx, 0, 'end', e.target.value)}
                              options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScheduleSlot(idx)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addScheduleSlot}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Day
                      </Button>
                    </div>
                  )}

                  {step === 5 && (
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
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  <Save className="mr-1 h-4 w-4" /> Save Draft
                </Button>
              </div>
              <div className="flex gap-2">
                {step < 5 ? (
                  <Button size="sm" onClick={goNext} disabled={!isStepValid()}>
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit} disabled={!isStepValid()}>
                    <Check className="mr-1 h-4 w-4" /> Complete Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
