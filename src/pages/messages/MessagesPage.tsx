import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  ChevronLeft,
  Circle,
  CheckCheck,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { messageService } from '@/services'
import { useAuthStore } from '@/stores'
import type { Conversation, Message } from '@/types'

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getConversationName(conversation: Conversation, currentUserId: string) {
  const otherId = conversation.participants.find((p) => p !== currentUserId)
  return otherId ? otherId.replace('teacher-', 'Teacher ').replace('parent-', 'Parent ') : 'Unknown'
}

function getConversationAvatar(_conversation: Conversation, _currentUserId: string) {
  return ''
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-2.5">
        <motion.span
          className="inline-block h-2 w-2 rounded-full bg-gray-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="inline-block h-2 w-2 rounded-full bg-gray-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.span
          className="inline-block h-2 w-2 rounded-full bg-gray-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    messageService.getConversations(user.id).then((res) => {
      setConversations(res)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!selectedConv) return
    messageService.getMessages(selectedConv).then(setMessages)
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return
    const conv = conversations.find((c) => c.id === selectedConv)
    if (!conv) return
    const receiverId = conv.participants.find((p) => p !== user.id) || ''
    const sent = await messageService.sendMessage(selectedConv, user.id, receiverId, newMessage)
    setMessages((prev) => [...prev, sent])
    setNewMessage('')
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  const filteredConversations = conversations.filter((c) =>
    getConversationName(c, user?.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConversation = conversations.find((c) => c.id === selectedConv)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <div className="w-full max-w-sm space-y-3 lg:w-96">
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="hidden flex-1 rounded-2xl lg:block" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:gap-0">
      <div
        className={`${
          showSidebar ? 'flex' : 'hidden'
        } w-full flex-col border-r border-border lg:flex lg:max-w-sm`}
      >
        <div className="border-b border-border p-4">
          <h2 className="mb-3 text-lg font-bold">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 divide-y divide-border overflow-y-auto">
          <AnimatePresence>
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv === conv.id
                return (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setSelectedConv(conv.id)
                      setShowSidebar(false)
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar>
                        <AvatarImage src={getConversationAvatar(conv, user?.id || '')} />
                        <AvatarFallback>
                          {getConversationName(conv, user?.id || '').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">
                          {getConversationName(conv, user?.id || '')}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs text-gray-500">
                          {conv.lastMessage.senderId === user?.id && (
                            <CheckCheck className="mr-0.5 inline-block h-3 w-3 text-blue-500" />
                          )}
                          {conv.lastMessage.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[20px] px-1.5 text-[10px]">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={`${!showSidebar ? 'flex' : 'hidden'} flex-1 flex-col lg:flex`}>
        {selectedConv && selectedConversation ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setShowSidebar(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src={getConversationAvatar(selectedConversation, user?.id || '')} />
                <AvatarFallback>
                  {getConversationName(selectedConversation, user?.id || '').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {getConversationName(selectedConversation, user?.id || '')}
                </p>
                <p className="flex items-center gap-1 text-xs text-green-600">
                  <Circle className="h-2 w-2 fill-current" /> Online
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence>
                {messages.map((msg) => {
                  const isSent = msg.senderId === user?.id
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`mb-3 flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isSent
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={`mt-1 flex items-center gap-1 text-[10px] ${
                            isSent ? 'text-blue-200' : 'text-gray-400'
                          }`}
                        >
                          <span>{formatTime(msg.timestamp)}</span>
                          {isSent && (
                            <CheckCheck
                              className={`h-3 w-3 ${msg.read ? 'text-blue-300' : ''}`}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-end gap-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-4"
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className="shrink-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Your Messages</h3>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Select a conversation from the left to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


