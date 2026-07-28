import api from './api'
import type { Conversation, Message } from '@/types'

export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data } = await api.get('/conversations', { params: { userId } })
    return data
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data } = await api.get(`/messages/${conversationId}`)
    return data
  },

  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string, type: string = 'text'): Promise<Message> {
    const { data } = await api.post('/messages', {
      conversation_id: conversationId,
      receiver_id: receiverId,
      content,
      type,
    })
    return data
  },
}
