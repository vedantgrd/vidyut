export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIPrompt {
  id: string;
  title: string;
  prompt: string;
}
