import api from './api'

export const settingsService = {
  async updateProfile(data: any): Promise<any> {
    const { data: res } = await api.patch('/settings/profile', data)
    return res
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post('/settings/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return data
  },

  async updateNotificationPreferences(prefs: any): Promise<any> {
    const { data } = await api.post('/settings/notification-preferences', prefs)
    return data
  },

  async deleteAccount(): Promise<{ message: string }> {
    const { data } = await api.delete('/settings/account')
    return data
  },
}
