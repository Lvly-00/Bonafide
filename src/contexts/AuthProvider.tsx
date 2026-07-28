import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { Skeleton } from '@/components/ui'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading, isLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        setUser(user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [setUser, setLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted">Loading LearnLink...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
