import { mockConversations, mockMessages } from '@/data/messages'
import type { Conversation, Message } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await delay(400)
    return mockConversations.filter(c => c.participants.includes(userId)) as unknown as Conversation[]
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(300)
    return (mockMessages[conversationId] || []) as unknown as Message[]
  },

  async sendMessage(conversationId: string, _senderId: string, _receiverId: string, content: string, type: string = 'text'): Promise<Message> {
    await delay(300)
    return {
      id: `msg-${Date.now()}`,
      senderId: _senderId,
      receiverId: _receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type: type as any,
    }
  },
}
