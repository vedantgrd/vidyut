import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useAIStore } from '@/features/ai/store/aiStore';
import { ChatBubble } from '@/features/ai/components/ChatBubble';
import { TypingIndicator } from '@/features/ai/components/TypingIndicator';
import { PromptSuggestionChip } from '@/features/ai/components/PromptSuggestionChip';
import { Button } from '@/components/ui/Button';

const SUGGESTED_PROMPTS = [
  { id: '1', title: 'Write an essay hook', prompt: 'Help me write a compelling hook for a scholarship essay about overcoming adversity.' },
  { id: '2', title: 'Find matching scholarships', prompt: 'What are the top 3 scholarships I am currently eligible for based on my profile?' },
  { id: '3', title: 'Review my application', prompt: 'Can you review my latest application draft for the State Excellence Award?' }
];

const AIAssistantPage: React.FC = () => {
  const { messages, isTyping, error, sendMessage, clearChat } = useAIStore();
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isTyping) return;
    sendMessage(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <DashboardHeader 
        title="AI Assistant"
        subtitle="Your personal copilot for discovering scholarships and writing applications."
        actions={
          <Button variant="secondary" onClick={clearChat} disabled={isTyping || messages.length <= 1}>
            <Trash2 size={16} />
            Clear Chat
          </Button>
        }
      />

      <DashboardSection className="flex-1" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 0 }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-xl)',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          {error && (
            <div style={{ alignSelf: 'center', color: '#ef4444', padding: 'var(--space-md)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', margin: 'var(--space-md) 0' }}>
              {error}
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {messages.length === 1 && !isTyping && (
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
            {SUGGESTED_PROMPTS.map(p => (
              <PromptSuggestionChip key={p.id} prompt={p} onClick={handlePromptClick} />
            ))}
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isTyping}
            style={{
              flex: 1,
              padding: 'var(--space-lg)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-md)',
              outline: 'none',
              transition: 'border-color var(--duration-fast) ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-magic-start)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          />
          <Button variant="primary" type="submit" disabled={!input.trim() || isTyping} style={{ padding: '0 var(--space-2xl)' }}>
            <Send size={20} />
          </Button>
        </form>
      </DashboardSection>
    </div>
  );
};

export default AIAssistantPage;
