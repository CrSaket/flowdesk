'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { nlQuery } from '@/lib/api'

type Message = {
  id: number
  role: 'user' | 'bono'
  text: string
  loading?: boolean
}

const SUGGESTIONS = [
  'Why did churn risk spike recently?',
  'What are the top SHAP drivers?',
  'How accurate is the current model?',
  'Which features matter most for predictions?',
]

let msgId = 0

export function JeffChat({ modelId }: { modelId: string | null }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++msgId,
      role: 'bono',
      text: "Hey! I'm Bono, your AI data analyst. I can interpret your model's SHAP values, explain predictions, flag anomalies, and answer anything about your data. What would you like to know?",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [fabPressed, setFabPressed] = useState(false)
  const [sendPressed, setSendPressed] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')

    const userMsg: Message = { id: ++msgId, role: 'user', text: q }
    const loadingMsg: Message = { id: ++msgId, role: 'bono', text: '', loading: true }
    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    try {
      const { answer } = await nlQuery(q, modelId)
      setMessages(prev =>
        prev.map(m => m.loading ? { ...m, text: answer, loading: false } : m)
      )
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.loading
            ? { ...m, text: err.message ?? 'Something went wrong. Make sure the backend is running.', loading: false }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    setSendPressed(true)
    setTimeout(() => setSendPressed(false), 150)
    send(input)
  }

  const handleFabClick = () => {
    setFabPressed(true)
    setTimeout(() => setFabPressed(false), 150)
    setOpen(v => !v)
  }

  return (
    <>
      <style>{`
        /* ── Bono chat animations ── */

        /* New message bubble pop-in */
        @keyframes bono-msg-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Suggestion chip stagger */
        @keyframes bono-chip-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0);    }
        }

        /* Typing dots */
        @keyframes bono-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8) translateY(0);   }
          40%           { opacity: 1;   transform: scale(1)   translateY(-3px); }
        }

        /* FAB pulse ring */
        @keyframes bono-pulse {
          0%,  100% { box-shadow: 0 0 0 0   rgba(79,70,255,0.4), 0 8px 24px rgba(79,70,255,0.45); }
          50%        { box-shadow: 0 0 0 10px rgba(79,70,255,0),  0 8px 24px rgba(79,70,255,0.45); }
        }

        /* Avatar gradient rotation */
        @keyframes bono-grad-spin {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }

        /* Reduced-motion: strip all */
        @media (prefers-reduced-motion: reduce) {
          .bono-panel, .bono-msg, .bono-chip, .bono-fab {
            animation: none !important;
            transition: opacity 0.01ms !important;
          }
        }
      `}</style>

      {/* ── Chat panel ── */}
      <AnimatePresence>
      {open && (
        <motion.div
          className="bono-panel"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.96, transition: { duration: 0.18, ease: [0.4, 0, 0.6, 1] } }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 360,
            maxHeight: 520,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-base)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,70,255,0.08)',
            zIndex: 1000,
            overflow: 'hidden',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-elevated)',
            flexShrink: 0,
          }}>
            {/* Animated avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#4F46FF,#00E5A0,#4F46FF)',
              backgroundSize: '200% 200%',
              animation: 'bono-grad-spin 4s ease infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff',
              boxShadow: '0 0 14px rgba(79,70,255,0.5)',
            }}>B</div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Bono</span>
                {/* Online dot */}
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#00E5A0',
                  boxShadow: '0 0 6px rgba(0,229,160,0.7)',
                  display: 'inline-block',
                  animation: 'bono-pulse 2.4s ease-in-out infinite',
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>AI Data Analyst · SHAP-powered</div>
            </div>

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 4, borderRadius: 6, display: 'flex',
                transition: 'color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.transform = 'scale(1)' }}
              aria-label="Minimize"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className="bono-msg"
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8,
                  alignItems: 'flex-end',
                  animation: `bono-msg-in 0.28s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.04, 0.12)}s both`,
                }}
              >
                {msg.role === 'bono' && (
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#4F46FF,#00E5A0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                  }}>B</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '9px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,#4F46FF,#6366f1)'
                    : 'var(--color-bg-elevated)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                }}>
                  {msg.loading ? (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--color-text-muted)',
                          display: 'inline-block',
                          animation: `bono-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </span>
                  ) : msg.text}
                </div>
              </div>
            ))}

            {/* Suggestion chips — staggered entrance */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    className="bono-chip"
                    onClick={() => send(s)}
                    style={{
                      textAlign: 'left',
                      background: 'rgba(79,70,255,0.07)',
                      border: '1px solid rgba(79,70,255,0.18)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s, transform 0.12s',
                      animation: `bono-chip-in 0.3s cubic-bezier(0.22,1,0.36,1) ${0.18 + i * 0.07}s both`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(79,70,255,0.14)'
                      e.currentTarget.style.borderColor = 'rgba(79,70,255,0.35)'
                      e.currentTarget.style.transform = 'translateX(3px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(79,70,255,0.07)'
                      e.currentTarget.style.borderColor = 'rgba(79,70,255,0.18)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex', gap: 8, padding: '10px 12px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask Bono anything…"
              disabled={loading}
              style={{
                flex: 1,
                background: 'var(--color-bg-base)',
                border: `1px solid ${inputFocused ? 'rgba(79,70,255,0.55)' : 'var(--color-border)'}`,
                boxShadow: inputFocused ? '0 0 0 3px rgba(79,70,255,0.12)' : 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.18s, box-shadow 0.18s',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg,#4F46FF,#6366f1)' : 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s, transform 0.12s, box-shadow 0.18s',
                transform: sendPressed ? 'scale(0.88)' : 'scale(1)',
                boxShadow: input.trim() && !loading && !sendPressed
                  ? '0 4px 12px rgba(79,70,255,0.35)'
                  : 'none',
              }}
              onMouseEnter={e => {
                if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.08)'
              }}
              onMouseLeave={e => {
                if (!sendPressed) e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Send
                size={14}
                color={input.trim() && !loading ? '#fff' : 'var(--color-text-muted)'}
                style={{ transition: 'transform 0.15s', transform: sendPressed ? 'translateX(2px) translateY(-2px)' : 'none' }}
              />
            </button>
          </form>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <button
        onClick={handleFabClick}
        className="bono-fab"
        aria-label="Chat with Bono"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: open
            ? 'var(--color-bg-elevated)'
            : 'linear-gradient(135deg,#4F46FF,#00E5A0)',
          border: open ? '1px solid var(--color-border)' : 'none',
          cursor: 'pointer', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.25s cubic-bezier(0.22,1,0.36,1), border 0.25s, box-shadow 0.25s',
          transform: fabPressed ? 'scale(0.9)' : 'scale(1)',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 8px 24px rgba(79,70,255,0.45)',
          animation: open ? 'none' : 'bono-pulse 2.8s ease-in-out infinite',
        }}
        onMouseEnter={e => {
          if (!fabPressed) e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={e => {
          if (!fabPressed) e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <span style={{
          position: 'absolute',
          transition: 'opacity 0.18s, transform 0.18s',
          opacity: open ? 0 : 1,
          transform: open ? 'rotate(90deg) scale(0.7)' : 'rotate(0deg) scale(1)',
          fontSize: 18, fontWeight: 800, color: '#fff',
        }}>B</span>
        <span style={{
          position: 'absolute',
          transition: 'opacity 0.18s, transform 0.18s',
          opacity: open ? 1 : 0,
          transform: open ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.7)',
          display: 'flex',
        }}>
          <X size={20} color={open ? 'var(--color-text-muted)' : '#fff'} />
        </span>
      </button>
    </>
  )
}
