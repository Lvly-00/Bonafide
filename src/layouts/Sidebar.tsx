import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import {
  LayoutDashboard, Users, BookOpen,
  TrendingUp, GraduationCap, FileText, BarChart3,
  ShieldCheck, UserCircle, Search, DollarSign, X, ClipboardCheck
} from 'lucide-react'
import { ROUTES } from '@/constants'

const parentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.PARENT_DASHBOARD },
  { icon: UserCircle, label: 'Child Profile', href: ROUTES.CHILD_PROFILE },
  { icon: Search, label: 'Find Teachers', href: ROUTES.MATCHING },
  { icon: BookOpen, label: 'Bookings', href: ROUTES.PARENT_DASHBOARD },
  { icon: TrendingUp, label: 'Progress', href: ROUTES.PROGRESS },
]

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.TEACHER_DASHBOARD },
  { icon: Users, label: 'My Students', href: ROUTES.TEACHER_STUDENTS },
  { icon: BookOpen, label: 'Sessions', href: ROUTES.TEACHER_SESSIONS },
  { icon: ClipboardCheck, label: 'Approvals', href: ROUTES.TEACHER_APPROVALS },
  { icon: DollarSign, label: 'Income', href: ROUTES.TEACHER_INCOME },
  { icon: FileText, label: 'Reflections', href: ROUTES.TEACHER_REFLECTION },
]

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
  { icon: Users, label: 'Users', href: ROUTES.ADMIN_USERS },
  { icon: GraduationCap, label: 'Teachers', href: ROUTES.ADMIN_TEACHERS },
  { icon: BookOpen, label: 'Bookings', href: ROUTES.ADMIN_BOOKINGS },
  { icon: ShieldCheck, label: 'Verification', href: ROUTES.ADMIN_VERIFICATION },
  { icon: BarChart3, label: 'Analytics', href: ROUTES.ADMIN_REPORTS },
]

const sectionLabels: Record<string, string> = {
  parent: 'Parent Menu',
  teacher: 'Teacher Menu',
  admin: 'Admin Menu',
}

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = (href: string) => window.location.pathname !== href && (window.location.href = href)

  const navItems = user?.role === 'parent' ? parentNavItems
    : user?.role === 'teacher' ? teacherNavItems
    : adminNavItems

  const sectionLabel = sectionLabels[user?.role || 'parent']

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-border transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:h-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label={sectionLabel}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:hidden">
            <span className="text-sm font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {sectionLabel}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
