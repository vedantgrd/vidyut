import { create } from 'zustand'
import { aiService, type ChatMessage } from '../services/ai.service'

interface AIState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true, error: null }))
    try {
      const response = await aiService.sendMessage(content)
      set((state) => ({
        messages: [...state.messages, response],
        isLoading: false,
      }))
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? 'Failed to get response' })
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}))
