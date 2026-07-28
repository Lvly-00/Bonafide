import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'

export function PrivateLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 p-5 lg:p-6 overflow-x-hidden">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
