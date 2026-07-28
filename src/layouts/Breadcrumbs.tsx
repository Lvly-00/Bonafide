import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  'parent': 'Parent',
  'teacher': 'Teacher',
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'child-profile': 'Child Profile',
  'assessment': 'AI Assessment',
  'matching': 'Find Teachers',
  'booking': 'Booking',
  'messages': 'Messages',
  'notifications': 'Notifications',
  'progress': 'Progress',
  'feedback': 'Feedback',
  'reflection': 'Reflection',
  'settings': 'Settings',
  'sessions': 'Sessions',
  'students': 'Students',
  'income': 'Income',
  'calendar': 'Calendar',
  'reports': 'Reports',
  'profile': 'Profile',
  'users': 'Users',
  'verification': 'Verification',
  'result': 'Result',
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  if (pathSegments.length <= 1) return null

  const crumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    const isLast = index === pathSegments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-primary transition-colors" aria-label="Home">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-gray-400" aria-hidden="true" />
          {crumb.isLast ? (
            <span className="text-gray-900 font-medium" aria-current="page">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
