import { parentDashboardData, teacherDashboardData, adminDashboardData } from '@/data/dashboard'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const dashboardService = {
  async getParentDashboard(userId: string): Promise<any> {
    await delay(500)
    return { ...parentDashboardData, userId }
  },

  async getTeacherDashboard(userId: string): Promise<any> {
    await delay(500)
    return { ...teacherDashboardData, userId }
  },

  async getAdminDashboard(): Promise<any> {
    await delay(600)
    return adminDashboardData
  },
}
