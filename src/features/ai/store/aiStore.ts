import { create } from 'zustand';
import { aiService } from '../services/ai.service';
import type { ChatMessage } from '../types';

interface AIState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am Vidyut AI. I can help you find scholarships, write essays, and organize your application timeline. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ],
  isTyping: false,
  error: null,

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      error: null
    }));

    try {
      const response = await aiService.sendMessage(content);
      set(state => ({
        messages: [...state.messages, response],
        isTyping: false
      }));
    } catch (err: any) {
      set({ 
        isTyping: false, 
        error: err.message || 'Failed to connect to AI Assistant.' 
      });
    }
  },

  clearChat: () => set({ 
    messages: [{
      id: 'welcome',
      role: 'assistant',
      content: 'Chat cleared. How can I help you next?',
      timestamp: new Date().toISOString()
    }], 
    error: null 
  })
}));
