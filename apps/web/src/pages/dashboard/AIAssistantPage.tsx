import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot, User } from 'lucide-react'
import { useAIStore } from '@/features/ai/store/aiStore'
import { DashboardHeader } from '@/features/dashboard/components/DashboardLayout'
import { Button } from '@/components/ui/Button'

const PROMPTS = [
  'What scholarships am I eligible for?',
  'How do I improve my match score?',
  'What documents do I need for government scholarships?',
  'Tell me about PM YASASVI scholarship',
]

const AIAssistantPage = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useAIStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    setInput('')
    await sendMessage(content)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <DashboardHeader
        title="AI Assistant"
        subtitle="Ask anything about scholarships, eligibility, or the application process."
        actions={
          messages.length > 0 ? (
            <Button variant="ghost" onClick={clearMessages}>
              <Trash2 size={14} style={{ marginRight: 6 }} />
              Clear chat
            </Button>
          ) : undefined
        }
      />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bot size={28} color="#4f46e5" />
            </div>
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>How can I help you?</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 24 }}>Ask me about scholarships, eligibility, documents, or deadlines.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => handleSend(p)} style={{ padding: '8px 14px', border: '1px solid var(--border-subtle)', borderRadius: 20, background: 'var(--surface-1)', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? '#4f46e5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="#6b7280" />}
            </div>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#4f46e5' : 'var(--surface-1)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#6b7280" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ask about scholarships..."
          disabled={isLoading}
          style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 14, outline: 'none', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
        />
        <Button variant="primary" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}

export default AIAssistantPage
