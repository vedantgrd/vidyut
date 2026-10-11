import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  conversationId?: string
}

export const aiService = {
  async sendMessage(message: string): Promise<ChatMessage> {
    const res = await ApiClient.post<ChatMessage>(ENDPOINTS.AI.CHAT, { content: message })
    return {
      ...res,
      timestamp: res.timestamp ?? new Date().toISOString(),
    }
  },
}
