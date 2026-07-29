import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthProvider'
import { QueryProvider } from '@/contexts/QueryProvider'
import { PublicLayout } from '@/layouts/PublicLayout'
import { PrivateLayout } from '@/layouts/PrivateLayout'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants'
import { Skeleton } from '@/components/ui'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const ParentDashboard = lazy(() => import('@/pages/parent/ParentDashboard'))
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const ChildProfilePage = lazy(() => import('@/pages/child/ChildProfilePage'))
const AddChildWizard = lazy(() => import('@/pages/child/AddChildWizard'))
const AssessmentPage = lazy(() => import('@/pages/assessment/AssessmentPage'))
const MatchingPage = lazy(() => import('@/pages/matching/MatchingPage'))
const TeachersPage = lazy(() => import('@/pages/teachers/TeachersPage'))
const TeacherProfilePage = lazy(() => import('@/pages/matching/TeacherProfilePage'))
const MessagesPage = lazy(() => import('@/pages/messages/MessagesPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const ReflectionPage = lazy(() => import('@/pages/reflection/ReflectionPage'))
const FeedbackPage = lazy(() => import('@/pages/feedback/FeedbackPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const TeacherStudentsPage = lazy(() => import('@/pages/teacher/TeacherStudentsPage'))
const TeacherSessionsPage = lazy(() => import('@/pages/teacher/TeacherSessionsPage'))
const TeacherCalendarPage = lazy(() => import('@/pages/teacher/TeacherCalendarPage'))
const TeacherReportsPage = lazy(() => import('@/pages/teacher/TeacherReportsPage'))
const TeacherStudentInfoPage = lazy(() => import('@/pages/teacher/TeacherStudentInfoPage'))
const TeacherApprovalsPage = lazy(() => import('@/pages/teacher/TeacherApprovalsPage'))
const BookingPage = lazy(() => import('@/pages/booking/BookingPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (isAuthenticated) {
    const { user } = useAuthStore.getState()
    if (user?.role === 'parent') return <Navigate to={ROUTES.PARENT_DASHBOARD} replace />
    if (user?.role === 'teacher') return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />
    if (user?.role === 'admin') return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path={ROUTES.HOME} element={<LandingPage />} />
                <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path={ROUTES.RESET_PASSWORD} element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                <Route path={ROUTES.VERIFY_EMAIL} element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
              </Route>

              <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
                <Route path={ROUTES.PARENT_DASHBOARD} element={<ParentDashboard />} />
                <Route path={ROUTES.TEACHER_DASHBOARD} element={<TeacherDashboard />} />
                <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
                <Route path={ROUTES.CHILD_PROFILE} element={<ChildProfilePage />} />
                <Route path={ROUTES.CHILD_PROFILE_EDIT} element={<ChildProfilePage />} />
                <Route path={ROUTES.CHILD_PROFILE_NEW} element={<AddChildWizard />} />
                <Route path={ROUTES.ASSESSMENT} element={<AssessmentPage />} />
                <Route path={ROUTES.ASSESSMENT_RESULT} element={<AssessmentPage />} />
                <Route path={ROUTES.MATCHING} element={<MatchingPage />} />
                <Route path={ROUTES.TEACHERS} element={<TeachersPage />} />
                <Route path={ROUTES.TEACHER_PROFILE} element={<TeacherProfilePage />} />
                <Route path={ROUTES.BOOKING} element={<BookingPage />} />
                <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
                <Route path={ROUTES.MESSAGE_CONVERSATION} element={<MessagesPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={ROUTES.REFLECTION} element={<ReflectionPage />} />
                <Route path={ROUTES.TEACHER_SESSIONS} element={<TeacherSessionsPage />} />
                <Route path={ROUTES.TEACHER_STUDENTS} element={<TeacherStudentsPage />} />
                <Route path={ROUTES.TEACHER_CALENDAR} element={<TeacherCalendarPage />} />
                <Route path={ROUTES.TEACHER_REPORTS} element={<TeacherReportsPage />} />
                <Route path={ROUTES.TEACHER_STUDENT_INFO} element={<TeacherStudentInfoPage />} />
                <Route path={ROUTES.TEACHER_APPROVALS} element={<TeacherApprovalsPage />} />
                <Route path={ROUTES.PARENT_FEEDBACK} element={<FeedbackPage />} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { borderRadius: '12px' },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}
