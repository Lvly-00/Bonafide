import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar, AvatarImage, AvatarFallback, Badge } from '@/components/ui'
import { ROUTES } from '@/constants'

export function Navbar() {
  const { user } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const roleDashboard = user?.role === 'parent' ? ROUTES.PARENT_DASHBOARD
    : user?.role === 'teacher' ? ROUTES.TEACHER_DASHBOARD
    : ROUTES.ADMIN_DASHBOARD

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to={user ? roleDashboard : ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <span className="text-sm font-bold text-white">L</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">LearnLink</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {user && (
            <>
              <button
                onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                  aria-label="Profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-lg border border-border bg-white p-1.5 shadow-lg animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={() => { navigate(ROUTES.SETTINGS); setShowProfileMenu(false) }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" /> Settings
                    </button>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => { useAuthStore.getState().logout(); navigate(ROUTES.LOGIN); setShowProfileMenu(false) }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN} className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link to={ROUTES.REGISTER} className="text-sm font-medium bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
