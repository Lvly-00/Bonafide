import api from './api'

export const dashboardService = {
  async getParentDashboard(userId: string): Promise<any> {
    const { data } = await api.get(`/dashboard/parent`)
    return data
  },

  async getTeacherDashboard(userId: string): Promise<any> {
    const { data } = await api.get(`/dashboard/teacher`)
    return data
  },

  async getAdminDashboard(): Promise<any> {
    const { data } = await api.get('/dashboard/admin')
    return data
  },
}
