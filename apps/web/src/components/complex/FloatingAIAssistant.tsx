import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I am Vidyut AI. I can clarify eligibility criteria, suggest documents from your vault, and help you fill forms. What can I do for you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await ApiClient.post<any>('/ai/ask', {
        question: userText
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.answer || 'Sorry, I failed to generate an answer.' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${err.message || 'Server unavailable'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Floating Trigger Orb */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--brand-magic-start)] to-[var(--brand-magic-mid)] flex items-center justify-center text-white shadow-[0_4px_20px_var(--border-glow)] hover:scale-105 active:scale-95 transition-transform border border-[var(--border-strong)] cursor-pointer"
          whileHover={{ rotate: 10 }}
          aria-label="Summon AI assistant"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.button>
      )}

      {/* Slide Up Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-80 sm:w-96 h-[480px] origin-bottom-right focus:outline-none"
          >
            <GlassCard
              variant="floating"
              padding="none"
              className="h-full border border-[var(--border-strong)] flex flex-col overflow-hidden shadow-[var(--elevation-3)] bg-[var(--surface-header)]"
            >
              {/* Header */}
              <div className="p-4 bg-[var(--surface-3)]/80 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-pulse" />
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[var(--interactive-primary)]" />
                    Vidyut AI
                  </h4>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--surface-2)] transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={i}
                      className={`flex gap-2.5 items-start ${isBot ? '' : 'flex-row-reverse'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs ${
                          isBot
                            ? 'bg-[var(--surface-3)] border-[var(--border-subtle)] text-[var(--interactive-primary)]'
                            : 'bg-[var(--interactive-primary)] border-[var(--interactive-primary)] text-white'
                        }`}
                      >
                        {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div
                        className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed ${
                          isBot
                            ? 'bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
                            : 'bg-[var(--surface-3)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-3)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--interactive-primary)]">
                      <Bot className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                    <div className="bg-[var(--surface-2)] border border-[var(--border-subtle)] px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Input Form Footer */}
              <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-3)]/30 flex gap-2 shrink-0">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  disabled={isLoading}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
