import { useEffect, useState } from 'react'
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
  Plus,
  Upload,
  Pencil,
  Trash2,
  BookOpen,
  Brain,
  Loader2,
  Calendar,
  GraduationCap,
  Star,
  Briefcase,
  DollarSign,
  ArrowRight,
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
  learningStyle: string[]
  avatar: string
}

const initialForm: ChildForm = {
  name: '',
  age: '',
  grade: '',
  interests: [],
  learningConcerns: [],
  strengths: [],
  learningStyle: [],
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
  const [submitting, setSubmitting] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [newChildId, setNewChildId] = useState<string | null>(null)
  const [newChildTeachers, setNewChildTeachers] = useState<MatchResult[]>([])

  useEffect(() => {
    if (!user?.id) return
    childService.getByParentId(user.id).then((data) => {
      setChildren(data)
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
      learningStyle: child.learningStyle ? child.learningStyle.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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

  const toggleArrayItem = (key: 'interests' | 'learningConcerns' | 'strengths' | 'learningStyle', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const payload = { ...form, age: Number(form.age), learningStyle: form.learningStyle.join(', '), profileCompleted: true }
    try {
      let child
      if (editingChild) {
        child = await childService.update(editingChild, payload)
      } else {
        child = await childService.create(payload)
      }
      setNewChildId(child.id)
      setSubmitting(false)
      setLoadingRecommendations(true)
      setDirection(1)
      setStep(5)
      const teachers = await childService.getRecommendedTeachers(child.id)
      setNewChildTeachers(teachers)
    } catch {
      // error handled by service
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleSkip = () => {
    resetForm()
  }

  const handleBrowseAll = () => {
    navigate(ROUTES.MATCHING)
  }

  const handleBookSession = (teacherId: string) => {
    if (newChildId) {
      navigate(ROUTES.BOOKING.replace(':teacherId', teacherId), {
        state: { preselectedChild: { id: newChildId, name: form.name } }
      })
    } else {
      navigate(ROUTES.BOOKING.replace(':teacherId', teacherId))
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
      case 3: return form.learningStyle.length > 0
      case 4: return true
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
              <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-0 shadow-md shadow-gray-200/50">
                <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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


                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => navigate(ROUTES.CHILD_DETAIL.replace(':id', child.id))}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={(e) => handleEdit(child, e)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
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
        <Card className="overflow-hidden border-0 shadow-xl shadow-gray-200/50">
          <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-blue-400" />
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-base">
              {editingChild ? 'Edit Profile' : 'New Profile'}
            </CardTitle>
            <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'w-5 bg-primary' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
              <span className="ml-2 text-xs text-gray-500">Step {Math.min(step, 4)}/4</span>
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
                    <div className="space-y-5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">Basic Information</h3>
                      </div>
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
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-800">Learning Concerns</h3>
                        </div>
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
                      <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                            <Sparkles className="h-4 w-4 text-green-600" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-800">Strengths</h3>
                        </div>
                        <p className="mb-1 text-xs text-gray-500">Select your child's key strengths</p>
                        <p className="mb-3 text-[10px] text-gray-400">For better matching</p>
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
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">Learning Style</h3>
                      </div>
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
                              onClick={() => toggleArrayItem('learningStyle', style)}
                              className={`rounded-xl border p-4 text-left transition-all ${
                                form.learningStyle.includes(style)
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
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                          <Camera className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">Profile Picture</h3>
                      </div>
                      <p className="text-xs text-gray-500">Upload a photo of your child</p>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-28 w-28 ring-2 ring-gray-100 ring-offset-2">
                            {form.avatar ? (
                              <AvatarImage src={form.avatar} alt="Preview" />
                            ) : (
                              <AvatarFallback className="text-3xl bg-gray-50">
                                {form.name ? form.name[0].toUpperCase() : '?'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
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

                  {step === 5 && (
                    <div className="space-y-4">
                      {loadingRecommendations ? (
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
                          <h3 className="text-lg font-semibold text-gray-700">AI is analyzing the best teacher match for your child...</h3>
                          <p className="mt-4 text-xs text-gray-400">Assessing learning profile and matching with tutors</p>
                        </div>
                      ) : newChildTeachers.length === 0 ? (
                        <div className="py-12 text-center">
                          <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-3 text-sm text-gray-500">No matching teachers found right now.</p>
                          <p className="text-xs text-gray-400">You can browse all teachers later.</p>
                          <div className="mt-4 flex justify-center gap-3">
                            <Button variant="outline" onClick={handleBrowseAll}>Browse All Teachers</Button>
                            <Button onClick={handleSkip}>Continue</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900">AI Match Results</h3>
                            <p className="text-sm text-gray-500">Based on your child's learning profile</p>
                          </div>

                          {newChildTeachers.length > 0 && (
                            <Card className="relative overflow-hidden border-2 border-primary shadow-lg">
                      <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-primary to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                        Best Match — {newChildTeachers[0].compatibilityScore}%
                      </div>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16">
                                    {newChildTeachers[0].avatar ? <AvatarImage src={newChildTeachers[0].avatar} /> : null}
                                    <AvatarFallback className="text-lg">{newChildTeachers[0].name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-lg font-bold text-gray-900">{newChildTeachers[0].name}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {newChildTeachers[0].subjects.slice(0, 4).map((s) => (
                                        <span key={s} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400" />{newChildTeachers[0].rating}</span>
                                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{newChildTeachers[0].experience}yr exp</span>
                                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${newChildTeachers[0].hourlyRate}/hr</span>
                                    </div>
                                    {newChildTeachers[0].matchReasons.length > 0 && (
                                      <div className="mt-3 space-y-1">
                                        {newChildTeachers[0].matchReasons.map((r, i) => (
                                          <p key={i} className="text-xs text-green-600">✓ {r}</p>
                                        ))}
                                      </div>
                                    )}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <Button size="sm" onClick={() => handleBookSession(newChildTeachers[0].teacherId)}>
                                        <Calendar className="mr-1 h-4 w-4" /> Book Session
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={handleBrowseAll}>
                                        Browse All
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {newChildTeachers.length > 1 && (
                            <div>
                              <h4 className="mb-3 text-sm font-semibold text-gray-700">Other Recommended Teachers</h4>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {newChildTeachers.slice(1).map((teacher) => (
                                  <Card key={teacher.teacherId} className="relative overflow-hidden">
                                    <div className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                      {teacher.compatibilityScore}% match
                                    </div>
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                          {teacher.avatar ? <AvatarImage src={teacher.avatar} /> : null}
                                          <AvatarFallback className="text-sm">{teacher.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-gray-900">{teacher.name}</p>
                                          <div className="mt-1 flex flex-wrap gap-1.5">
                                            {teacher.subjects.slice(0, 3).map((s) => (
                                              <span key={s} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{teacher.rating}</span>
                                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{teacher.experience}yr</span>
                                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${teacher.hourlyRate}/hr</span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        className="mt-3 w-full"
                                        onClick={() => handleBookSession(teacher.teacherId)}
                                      >
                                        <Calendar className="mr-1 h-3.5 w-3.5" /> Book Session
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-center gap-3 pt-2">
                            <Button variant="outline" onClick={handleBrowseAll}>
                              <ArrowRight className="mr-1.5 h-4 w-4" /> Browse All Teachers
                            </Button>
                            <button
                              type="button"
                              onClick={handleSkip}
                              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              Skip for now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {step < 5 && (
              <div className="flex items-center justify-between border-t pt-5">
                <div>
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
                    <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-4 w-4" />
                      )}
                      Complete Profile
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
