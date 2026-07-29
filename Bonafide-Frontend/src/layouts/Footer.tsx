import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/Bonafide.png" alt="Bonafide" className="h-8 w-8 rounded-lg shadow-sm object-cover" />
              <span className="text-lg font-bold text-gray-900">Bonafide</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Connecting parents with the perfect teachers for their children's unique learning needs.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2.5">
              <li><Link to={ROUTES.MATCHING} className="text-sm text-gray-500 hover:text-primary transition-colors">Find Teachers</Link></li>
              <li><Link to={ROUTES.ASSESSMENT} className="text-sm text-gray-500 hover:text-primary transition-colors">AI Assessment</Link></li>
              <li><Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-gray-500">Help Center</span></li>
              <li><span className="text-sm text-gray-500">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-500">Terms of Service</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-gray-500">hello@bonafide.ai</span></li>
              <li><span className="text-sm text-gray-500">1-800-BONAFIDE</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-center text-xs text-gray-400">&copy; 2026 Bonafide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
