const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const settingsService = {
  async updateProfile(data: any): Promise<any> {
    await delay(800)
    return { ...data, updatedAt: new Date().toISOString() }
  },

  async changePassword(_currentPassword: string, _newPassword: string): Promise<{ message: string }> {
    await delay(800)
    return { message: 'Password changed successfully' }
  },

  async updateNotificationPreferences(_prefs: any): Promise<any> {
    await delay(400)
    return { message: 'Preferences updated' }
  },

  async deleteAccount(): Promise<{ message: string }> {
    await delay(1000)
    return { message: 'Account deleted successfully' }
  },
}
