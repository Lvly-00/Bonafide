export const mockConversations = [
  {
    id: 'conv-1',
    participants: ['parent-1', 'teacher-1'],
    lastMessage: {
      id: 'msg-6',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'Liam did great today! He mastered the 7x table.',
      timestamp: '2026-07-28T17:05:00Z',
      read: false,
      type: 'text' as const,
    },
    unreadCount: 2,
    updatedAt: '2026-07-28T17:05:00Z',
  },
  {
    id: 'conv-2',
    participants: ['parent-1', 'teacher-3'],
    lastMessage: {
      id: 'msg-10',
      senderId: 'parent-1',
      receiverId: 'teacher-3',
      content: 'Perfect, see you on Friday!',
      timestamp: '2026-07-27T14:30:00Z',
      read: true,
      type: 'text' as const,
    },
    unreadCount: 0,
    updatedAt: '2026-07-27T14:30:00Z',
  },
]

export const mockMessages: Record<string, {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'voice' | 'file'
}[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'Hi Sarah! Just wanted to let you know Liam did great in today\'s session.',
      timestamp: '2026-07-25T17:00:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      senderId: 'parent-1',
      receiverId: 'teacher-1',
      content: 'That\'s wonderful to hear! How did he do with the fractions?',
      timestamp: '2026-07-25T17:05:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-3',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'He picked it up really quickly! The pizza analogy worked perfectly. He could identify 1/2, 1/4, and 3/4 without any help.',
      timestamp: '2026-07-25T17:08:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-4',
      senderId: 'parent-1',
      receiverId: 'teacher-1',
      content: 'That\'s great progress! Thank you so much for your patience with him.',
      timestamp: '2026-07-25T17:10:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-5',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'Of course! He\'s a joy to teach. I\'ve sent his homework for the week.',
      timestamp: '2026-07-25T17:12:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-6',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'Liam did great today! He mastered the 7x table.',
      timestamp: '2026-07-28T17:05:00Z',
      read: false,
      type: 'text',
    },
    {
      id: 'msg-7',
      senderId: 'teacher-1',
      receiverId: 'parent-1',
      content: 'I sent the new worksheet for next week. We\'ll start on 8x tables.',
      timestamp: '2026-07-28T17:06:00Z',
      read: false,
      type: 'text',
    },
  ],
  'conv-2': [
    {
      id: 'msg-8',
      senderId: 'teacher-3',
      receiverId: 'parent-1',
      content: 'Hi Sarah! I\'m excited to start coding sessions with Liam.',
      timestamp: '2026-07-26T10:00:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-9',
      senderId: 'teacher-3',
      receiverId: 'parent-1',
      content: 'I\'ve prepared a fun introductory lesson using Scratch. He\'s going to love it!',
      timestamp: '2026-07-26T10:02:00Z',
      read: true,
      type: 'text',
    },
    {
      id: 'msg-10',
      senderId: 'parent-1',
      receiverId: 'teacher-3',
      content: 'Perfect, see you on Friday!',
      timestamp: '2026-07-27T14:30:00Z',
      read: true,
      type: 'text',
    },
  ],
}
