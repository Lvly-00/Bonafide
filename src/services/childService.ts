import { mockChildren } from '@/data/children'
import type { Child } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const childService = {
  async getByParentId(parentId: string): Promise<Child[]> {
    await delay(400)
    return mockChildren.filter(c => c.parentId === parentId) as unknown as Child[]
  },

  async getById(id: string): Promise<Child | null> {
    await delay(300)
    return (mockChildren.find(c => c.id === id) as unknown as Child) || null
  },

  async create(data: Partial<Child>): Promise<Child> {
    await delay(600)
    return { id: `child-${Date.now()}`, ...data } as unknown as Child
  },

  async update(id: string, data: Partial<Child>): Promise<Child> {
    await delay(500)
    const child = mockChildren.find(c => c.id === id)
    if (!child) throw new Error('Child not found')
    return { ...child, ...data } as unknown as Child
  },

  async delete(id: string): Promise<void> {
    await delay(300)
    const idx = mockChildren.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Child not found')
    mockChildren.splice(idx, 1)
  },
}
