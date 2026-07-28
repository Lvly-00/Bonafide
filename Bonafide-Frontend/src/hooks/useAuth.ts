import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import type { User } from '@/types'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

function getErrorMessage(error: AxiosError<{ message?: string }>): string {
  return error.response?.data?.message || error.message || 'Something went wrong'
}

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, setLoading, logout: clearAuth } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.login(email, password)
      setUser(result.user)
      setToken(result.token)
      toast.success('Welcome back!')
      return result.user
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setToken, setLoading])

  const register = useCallback(async (data: { name: string; email: string; password: string; role: string }) => {
    setLoading(true)
    try {
      const result = await authService.register(data)
      setUser(result.user)
      setToken(result.token)
      toast.success('Account created successfully!')
      return result.user
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setToken, setLoading])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
      toast.success('Logged out successfully')
    }
  }, [clearAuth])

  const forgotPassword = useCallback(async (email: string) => {
    const result = await authService.forgotPassword(email)
    toast.success(result.message)
    return result
  }, [])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    setUser,
  }
}
