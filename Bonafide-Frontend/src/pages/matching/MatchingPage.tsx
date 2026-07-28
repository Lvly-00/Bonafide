import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  MapPin,
  Heart,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { teacherService } from '@/services'
import { SUBJECTS } from '@/constants'
import type { Teacher } from '@/types'
import { useAuthStore } from '@/stores/authStore'

const ITEMS_PER_PAGE = 6

const sortOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'experience', label: 'Experience' },
]

export default function MatchingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [locationFilter, setLocationFilter] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    teacherService.getAll().then((res) => {
      setTeachers(res as unknown as Teacher[])
      setLoading(false)
    })
    teacherService.getFavorites().then((ids: string[]) => setFavorites(new Set(ids)))
  }, [])

  const filtered = useMemo(() => {
    let result = [...teachers]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)) ||
          t.location.toLowerCase().includes(q)
      )
    }

    if (selectedSubjects.length > 0) {
      result = result.filter((t) =>
        selectedSubjects.some((s) => t.subjects.includes(s))
      )
    }

    if (ratingFilter > 0) {
      result = result.filter((t) => t.rating >= ratingFilter)
    }

    if (locationFilter) {
      const loc = locationFilter.toLowerCase()
      result = result.filter((t) => t.location.toLowerCase().includes(loc))
    }

    switch (sortBy) {
      case 'experience':
        result.sort((a, b) => b.experience - a.experience)
        break
      default:
        result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [teachers, searchQuery, selectedSubjects, ratingFilter, locationFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
    setPage(1)
  }

  const toggleFavorite = (id: string) => {
    const isFav = favorites.has(id)
    if (isFav) {
      teacherService.unfavorite(id)
    } else {
      teacherService.favorite(id)
    }
    setFavorites((prev) => {
      const next = new Set(prev)
      isFav ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setSelectedSubjects([])
    setRatingFilter(0)
    setLocationFilter('')
    setSearchQuery('')
    setPage(1)
  }

  const hasActiveFilters = selectedSubjects.length > 0 || ratingFilter > 0 || locationFilter

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Find a Teacher</h1>
        <p className="text-sm text-gray-500">Discover the perfect teacher for your child</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, subject, or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {(selectedSubjects.length + (ratingFilter > 0 ? 1 : 0) + (locationFilter ? 1 : 0))}
              </span>
            )}
          </Button>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-40"
          />
          <div className="flex rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-l-xl p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-r-xl p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-xs font-semibold text-gray-500">Subject</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECTS.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            selectedSubjects.includes(subject)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-gray-500">Min Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => { setRatingFilter(ratingFilter === star ? 0 : star); setPage(1) }}
                          >
                            <Star
                              className={`h-5 w-5 transition-colors ${
                                star <= ratingFilter
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-gray-500">Location</p>
                      <Input
                        placeholder="City, State..."
                        className="w-36"
                        value={locationFilter}
                        onChange={(e) => { setLocationFilter(e.target.value); setPage(1) }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="mt-5 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {paginated.map((teacher) => (
            <motion.div
              key={teacher.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`group relative ${viewMode === 'list' ? 'flex' : ''}`}>
                <button
                  onClick={() => toggleFavorite(teacher.id)}
                  className={`absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors ${
                    favorites.has(teacher.id)
                      ? 'bg-red-50 text-red-500'
                      : 'bg-white/80 text-gray-300 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${favorites.has(teacher.id) ? 'fill-red-500' : ''}`}
                  />
                </button>

                <CardContent className={`flex-1 p-5 ${viewMode === 'list' ? 'flex items-center gap-5' : ''}`}>
                  <div className={`flex ${viewMode === 'list' ? 'items-center gap-4 flex-1' : 'flex-col items-center text-center'}`}>
                    <Avatar className={`${viewMode === 'list' ? 'h-14 w-14' : 'mb-3 h-20 w-20'}`}>
                      <AvatarImage src={teacher.avatar} />
                      <AvatarFallback>{teacher.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className={`${viewMode === 'list' ? 'flex-1 text-left' : ''}`}>
                      <h3 className="font-semibold">{teacher.name}</h3>
                      <div className={`mt-0.5 flex items-center gap-1 ${viewMode === 'list' ? '' : 'justify-center'}`}>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(teacher.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({teacher.rating})</span>
                      </div>

                      <div className={`mt-2 flex flex-wrap gap-1.5 ${viewMode === 'list' ? '' : 'justify-center'}`}>
                        {teacher.subjects.slice(0, 3).map((subj) => (
                          <Badge key={subj} variant="secondary" className="text-[10px]">
                            {subj}
                          </Badge>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{teacher.subjects.length - 3}
                          </Badge>
                        )}
                      </div>

                      {teacher.bio && (
                        <p className={`mt-2 text-xs leading-relaxed text-gray-500 ${viewMode === 'list' ? '' : 'line-clamp-2'}`}>
                          {teacher.bio}
                        </p>
                      )}

                      <div className={`mt-2 ${viewMode === 'list' ? '' : 'flex justify-center'}`}>
                        {teacher.rating >= 4.8 && (
                          <Badge variant="success" className="text-[10px]">
                            High Compatibility
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className={`flex gap-2 ${viewMode === 'list' ? 'mt-0' : 'mt-4 w-full border-t border-border pt-4'} justify-center`}>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/parent/teacher/${teacher.id}`)}>
                        View Profile
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/parent/booking/${teacher.id}`)}>Book Session</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <Search className="h-10 w-10" />
          <p className="text-sm">No teachers found matching your criteria</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  )
}
