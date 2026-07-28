import { mockUsers, mockCurrentUser } from '@/data/users'
import type { User } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authService = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(800)
    const user = mockUsers.find(u => u.email === email)
    if (!user) throw new Error('Invalid credentials')
    return { user: user as unknown as User, token: 'mock-jwt-token' }
  },

  async register(data: { name: string; email: string; password: string; role: string }): Promise<{ user: User; token: string }> {
    await delay(1000)
    const user = { id: `user-${Date.now()}`, ...data, avatar: '', phone: '', createdAt: new Date().toISOString() } as unknown as User
    return { user, token: 'mock-jwt-token' }
  },

  async logout(): Promise<void> {
    await delay(300)
  },

  async forgotPassword(_email: string): Promise<{ message: string }> {
    await delay(800)
    return { message: 'Password reset link sent to your email' }
  },

  async resetPassword(_token: string, _password: string): Promise<{ message: string }> {
    await delay(800)
    return { message: 'Password has been reset successfully' }
  },

  async verifyEmail(_token: string): Promise<{ message: string }> {
    await delay(800)
    return { message: 'Email verified successfully' }
  },

  async getCurrentUser(): Promise<User> {
    await delay(400)
    return mockCurrentUser as unknown as User
  },
}
