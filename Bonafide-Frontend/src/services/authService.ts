import api from './api'
import type { User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async register(data: { name: string; email: string; password: string; role: string }): Promise<{ user: User; token: string }> {
    const { data: res } = await api.post('/auth/register', data)
    return res
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, email: '', password })
    return data
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/verify-email', { token })
    return data
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get('/auth/user')
    return data.user
  },
}
