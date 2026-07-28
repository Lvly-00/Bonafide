import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Clock,
  BookOpen,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { teacherService } from '@/services'
import { ROUTES } from '@/constants'
import type { Teacher, Review } from '@/types'

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bio')

  useEffect(() => {
    if (!id) return
    Promise.all([
      teacherService.getById(id),
      teacherService.getReviews(id),
    ]).then(([teacherData, reviewData]) => {
      setTeacher(teacherData as unknown as Teacher)
      setReviews(reviewData as unknown as Review[])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
        <GraduationCap className="h-12 w-12" />
        <p>Teacher not found</p>
        <Button variant="outline">
          <Link to={ROUTES.MATCHING}>Back to Teachers</Link>
        </Button>
      </div>
    )
  }

  const ratingBreakdown = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    const idx = Math.min(Math.floor(r.rating), 5) - 1
    if (idx >= 0) ratingBreakdown[idx]++
  })
  const maxCount = Math.max(...ratingBreakdown, 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Link
        to={ROUTES.MATCHING}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to teachers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={teacher.avatar} />
                  <AvatarFallback className="text-lg">
                    {teacher.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold">{teacher.name}</h1>
                  <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(teacher.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {teacher.rating} ({reviews.length} reviews)
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 sm:justify-start">
                    <MapPin className="h-3.5 w-3.5" />
                    {teacher.location}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {teacher.subjects.map((subj) => (
                      <Badge key={subj} variant="secondary">
                        {subj}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="bio" active={activeTab === 'bio'}>Bio</TabsTrigger>
              <TabsTrigger value="education" active={activeTab === 'education'}>Education</TabsTrigger>
              <TabsTrigger value="certificates" active={activeTab === 'certificates'}>Certificates</TabsTrigger>
              <TabsTrigger value="reviews" active={activeTab === 'reviews'}>
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="availability" active={activeTab === 'availability'}>Availability</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === 'bio' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-gray-600">{teacher.bio}</p>
                  {teacher.languages && (
                    <div className="mt-4">
                      <p className="mb-1.5 text-xs font-semibold text-gray-500">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.languages.map((lang) => (
                          <Badge key={lang} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'education' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Education & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary-light p-2 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Education</p>
                      <p className="text-sm text-gray-500">{teacher.education}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary-light p-2 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-sm text-gray-500">{teacher.experience} years of teaching experience</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4 text-primary" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teacher.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-start gap-3 rounded-xl border border-border p-4"
                    >
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cert.name}</p>
                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{cert.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reviews & Ratings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-800">{teacher.rating}</p>
                      <div className="mt-1 flex justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(teacher.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingBreakdown[star - 1]
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-8 text-right text-gray-500">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-amber-400 transition-all"
                                style={{ width: `${(count / maxCount) * 100}%` }}
                              />
                            </div>
                            <span className="w-6 text-gray-500">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="divide-y">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={review.parentAvatar} />
                          <AvatarFallback>{review.parentName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{review.parentName}</p>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <div className="mt-0.5 flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'availability' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => {
                        const avail = teacher.availability.find((a) => a.day === day)
                        return (
                          <div
                            key={day}
                            className={`rounded-xl border p-3.5 ${
                              avail ? 'border-border' : 'border-dashed border-gray-200 bg-gray-50'
                            }`}
                          >
                            <p className="text-sm font-medium">{day}</p>
                            {avail ? (
                              <div className="mt-1.5 space-y-1">
                                {avail.slots.map((slot, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 text-xs text-gray-500"
                                  >
                                    <Clock className="h-3 w-3" />
                                    {slot.start} - {slot.end}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1.5 text-xs text-gray-300">Not available</p>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <Button className="w-full" size="lg" onClick={() => navigate(`/parent/booking/${teacher.id}`)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Session
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Students</span>
                    <span className="font-semibold">{teacher.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Sessions</span>
                    <span className="font-semibold">{teacher.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold">{teacher.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {teacher.rating}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
