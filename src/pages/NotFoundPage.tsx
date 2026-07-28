import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Home, ArrowLeft, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary-light p-4">
            <SearchX className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" onClick={() => window.history.back()}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
          </Link>
          <Link to="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
