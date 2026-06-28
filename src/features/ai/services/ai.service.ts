import type { ChatMessage } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_RESPONSES = [
  "That's a great question. Based on your profile, I recommend focusing on your leadership experience in your essay.",
  "I've analyzed the state scholarships, and you're a 98% match for the Tech Foundation grant. Would you like help drafting the application?",
  "Sure, I can help you structure your personal statement. Let's start with a strong hook about your background.",
  "Don't forget to highlight your volunteer work at the local community center. That's a strong indicator of civic engagement.",
  "I've updated your Scholarship DNA profile based on that information. This unlocks 3 new opportunities for you."
];

export const aiService = {
  async sendMessage(_message: string): Promise<ChatMessage> {
    // Simulate streaming/thinking latency
    await delay(1500 + Math.random() * 1500); 
    
    return {
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
      timestamp: new Date().toISOString()
    };
  }
};
