import { mockBookings } from '@/data/bookings'
import type { Booking } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    await delay(500)
    return mockBookings as unknown as Booking[]
  },

  async getByParentId(parentId: string): Promise<Booking[]> {
    await delay(400)
    return mockBookings.filter(b => b.parentId === parentId) as unknown as Booking[]
  },

  async getByTeacherId(teacherId: string): Promise<Booking[]> {
    await delay(400)
    return mockBookings.filter(b => b.teacherId === teacherId) as unknown as Booking[]
  },

  async getById(id: string): Promise<Booking | null> {
    await delay(300)
    return (mockBookings.find(b => b.id === id) as unknown as Booking) || null
  },

  async create(data: Partial<Booking>): Promise<Booking> {
    await delay(800)
    return { id: `booking-${Date.now()}`, createdAt: new Date().toISOString(), ...data } as unknown as Booking
  },

  async cancel(id: string): Promise<void> {
    await delay(500)
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await delay(300)
    const booking = mockBookings.find(b => b.id === id)
    if (booking) {
      (booking as any).status = status
    }
  },
}
