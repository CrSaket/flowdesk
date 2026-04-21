'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import './home.css'
import { GooeyFilter } from '@/components/ui/gooey-filter'
import { PixelTrail } from '@/components/ui/pixel-trail'
import { useScreenSize } from '@/hooks/use-screen-size'
import { motion } from 'framer-motion'

/* ── Shutter character reveal ── */
function ShutterChar({ char, delay = 0, className, style }: {
  char: string
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  if (char === ' ') return <span style={{ display: 'inline-block', width: '0.3em' }} />
  return (
    <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
      {/* Main character — fades in with blur */}
      <motion.span
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ delay: delay + 0.28, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={{ display: 'inline-block', ...style }}
      >
        {char}
      </motion.span>
      {/* Slice 1 — top 35% */}
      <motion.span
        aria-hidden="true"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '100%', opacity: [0, 1, 0] }}
        transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0,100% 0,100% 35%,0 35%)', color: '#7C74FF', ...style }}
      >
        {char}
      </motion.span>
      {/* Slice 2 — mid 35–65% */}
      <motion.span
        aria-hidden="true"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: '-100%', opacity: [0, 1, 0] }}
        transition={{ duration: 0.62, delay: delay + 0.08, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 35%,100% 35%,100% 65%,0 65%)', ...style }}
      >
        {char}
      </motion.span>
      {/* Slice 3 — bottom 65–100% */}
      <motion.span
        aria-hidden="true"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '100%', opacity: [0, 1, 0] }}
        transition={{ duration: 0.62, delay: delay + 0.16, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 65%,100% 65%,100% 100%,0 100%)', color: '#7C74FF', ...style }}
      >
        {char}
      </motion.span>
    </span>
  )
}

function ShutterText({ text, baseDelay = 0, className, style }: {
  text: string
  baseDelay?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <>
      {text.split('').map((char, i) => (
        <ShutterChar key={i} char={char} delay={baseDelay + i * 0.042} className={className} style={style} />
      ))}
    </>
  )
}

/* ── Animated counter hook ── */
function useCounter(target: number, started: boolean, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setValue(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return value
}

/* ── Reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); obs.disconnect() }
    }, { rootMargin: '-80px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ── Marquee items ── */
const MARQUEE_ITEMS = [
  'Cash flow clarity',
  'Revenue forecasting',
  'Expense intelligence',
  'Runway planning',
  'Plain-English insights',
  'Zero spreadsheets',
]

/* ── FAQ data ── */
const FAQS = [
  {
    q: 'How does FlowDesk connect to my accounts?',
    a: 'We use bank-grade OAuth integrations with Plaid and direct connections to QuickBooks, Xero, and Stripe. Read-only access — we never touch your transactions.'
  },
  {
    q: 'How accurate are the forecasts?',
    a: 'FlowDesk uses 18 months of historical patterns to project forward. Most users see within ±7% accuracy at 90 days out. You can always adjust assumptions manually.'
  },
  {
    q: 'Do I need an accountant to use this?',
    a: 'No. FlowDesk is built for operators, not accountants. Every number comes with a plain-English explanation of what it means for your business.'
  },
  {
    q: 'What businesses does FlowDesk work for?',
    a: 'Services, SaaS, retail, restaurants, agencies — any business with at least 6 months of transaction history. We work best with $20k–$5M in annual revenue.'
  },
  {
    q: 'Is my data secure?',
    a: 'SOC 2 Type II certified. AES-256 encryption at rest, TLS 1.3 in transit. We never sell or share your data. You can delete everything at any time.'
  },
]

/* ── Tour panels ── */
const TOUR_TABS = [
  { id: 'overview', n: '01', label: 'Overview' },
  { id: 'cashflow', n: '02', label: 'Cash flow' },
  { id: 'forecasts', n: '03', label: 'Forecasts' },
  { id: 'ask', n: '04', label: 'Ask FlowDesk' },
]

/* ── Feature cards ── */
const FEATURES = [
  {
    num: '01',
    name: 'Cash Position',
    desc: 'See exactly where every dollar sits across all accounts, updated every hour.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="0" y="60" width="32" height="60" rx="3" fill="rgba(110,103,255,0.25)" />
        <rect x="40" y="40" width="32" height="80" rx="3" fill="rgba(110,103,255,0.35)" />
        <rect x="80" y="20" width="32" height="100" rx="3" fill="rgba(110,103,255,0.5)" />
        <rect x="120" y="30" width="32" height="90" rx="3" fill="rgba(110,103,255,0.65)" />
        <rect x="160" y="10" width="32" height="110" rx="3" fill="rgba(110,103,255,0.8)" />
        <rect x="200" y="0" width="32" height="120" rx="3" fill="var(--accent)" />
        <line x1="0" y1="119" x2="280" y2="119" stroke="var(--line)" strokeWidth="1" />
      </svg>
    )
  },
  {
    num: '02',
    name: 'Revenue Tracking',
    desc: 'Understand your income streams — recurring, one-time, and projected — at a glance.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M0 90 C40 80, 60 40, 100 35 C140 30, 160 55, 200 45 C230 38, 250 25, 280 20" stroke="var(--accent)" strokeWidth="2" fill="none" />
        <path d="M0 90 C40 80, 60 40, 100 35 C140 30, 160 55, 200 45 C230 38, 250 25, 280 20 L280 120 L0 120Z" fill="rgba(110,103,255,0.08)" />
        <circle cx="200" cy="45" r="4" fill="var(--accent)" />
        <circle cx="100" cy="35" r="4" fill="var(--accent-2)" />
      </svg>
    )
  },
  {
    num: '03',
    name: 'Expense Intelligence',
    desc: 'Auto-categorized spending with anomaly detection — know when something\'s off before it hurts.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="70" cy="60" r="50" fill="none" stroke="var(--line-2)" strokeWidth="1" />
        <path d="M70 10 A50 50 0 0 1 120 60" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M120 60 A50 50 0 0 1 70 110" stroke="var(--accent-2)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M70 110 A50 50 0 0 1 23 35" stroke="rgba(110,103,255,0.4)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M23 35 A50 50 0 0 1 70 10" stroke="rgba(110,103,255,0.2)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <text x="160" y="36" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-mono)">Payroll 34%</text>
        <text x="160" y="56" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-mono)">Tools 22%</text>
        <text x="160" y="76" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-mono)">Ops 27%</text>
        <text x="160" y="96" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-mono)">Other 17%</text>
      </svg>
    )
  },
  {
    num: '04',
    name: 'Runway Forecasting',
    desc: 'Know exactly how many months of operating capital you have — under three scenarios.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <line x1="0" y1="119" x2="280" y2="119" stroke="var(--line)" strokeWidth="1" />
        <path d="M0 40 C60 38, 120 45, 180 80 C210 95, 240 108, 280 115" stroke="rgba(255,127,137,0.6)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        <path d="M0 40 C60 30, 120 25, 180 30 C220 34, 250 40, 280 45" stroke="var(--accent-2)" strokeWidth="2" fill="none" />
        <path d="M0 40 C60 35, 120 20, 180 15 C220 10, 250 8, 280 5" stroke="rgba(127,229,184,0.6)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        <line x1="0" y1="40" x2="180" y2="40" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="180" cy="30" r="3" fill="var(--accent-2)" />
        <text x="185" y="28" fill="var(--fg-3)" fontSize="10" fontFamily="var(--font-mono)">Today</text>
      </svg>
    )
  },
  {
    num: '05',
    name: 'Plain-English Alerts',
    desc: 'No dashboards to decode. FlowDesk tells you what changed, why it matters, and what to do.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="280" height="42" rx="8" fill="rgba(127,229,184,0.07)" stroke="rgba(127,229,184,0.2)" strokeWidth="1" />
        <circle cx="16" cy="21" r="5" fill="rgba(127,229,184,0.3)" />
        <text x="28" y="17" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-sans)">Revenue up 18% this month.</text>
        <text x="28" y="31" fill="var(--fg-3)" fontSize="10" fontFamily="var(--font-sans)">Stripe recurring revenue driving growth.</text>
        <rect x="0" y="52" width="280" height="42" rx="8" fill="rgba(255,127,137,0.07)" stroke="rgba(255,127,137,0.2)" strokeWidth="1" />
        <circle cx="16" cy="73" r="5" fill="rgba(255,127,137,0.3)" />
        <text x="28" y="69" fill="var(--fg-2)" fontSize="11" fontFamily="var(--font-sans)">Payroll +$4,200 vs last month.</text>
        <text x="28" y="83" fill="var(--fg-3)" fontSize="10" fontFamily="var(--font-sans)">3 new hires started this cycle.</text>
      </svg>
    )
  },
  {
    num: '06',
    name: 'Ask Anything',
    desc: 'Type a question about your business finances. Get a direct, honest answer in seconds.',
    viz: (
      <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="260" height="36" rx="18" fill="rgba(255,255,255,0.03)" stroke="var(--line-2)" strokeWidth="1" />
        <text x="16" y="23" fill="var(--fg-3)" fontSize="12" fontFamily="var(--font-sans)">How long can we operate at this rate?</text>
        <rect x="0" y="48" width="280" height="60" rx="10" fill="rgba(110,103,255,0.06)" stroke="rgba(110,103,255,0.2)" strokeWidth="1" />
        <text x="14" y="68" fill="var(--fg)" fontSize="12" fontFamily="var(--font-sans)">At current burn you have</text>
        <text x="14" y="84" fill="var(--accent-2)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="500">14.2 months of runway.</text>
        <text x="14" y="100" fill="var(--fg-3)" fontSize="11" fontFamily="var(--font-sans)">Based on $47k avg monthly spend.</text>
      </svg>
    )
  },
]

/* ── Overview tour panel content ── */
function TourOverview() {
  return (
    <div className="hn-tp-body">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { lab: 'Net Cash', val: '$84,210', delta: '+$6,400 this month', up: true },
          { lab: 'Monthly Revenue', val: '$31,450', delta: '+18.4% vs last', up: true },
          { lab: 'Burn Rate', val: '$22,800', delta: '+$1,200 vs plan', up: false },
        ].map(s => (
          <div key={s.lab} className="hn-mstat">
            <div className="hn-mlab">{s.lab}</div>
            <div className="hn-mval">{s.val}</div>
            <div className={`hn-mdelta${s.up ? '' : ' down'}`}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div className="hn-mchart">
        <div className="hn-mchart-head">
          <h4>Cash Position — 90 days</h4>
          <div className="hn-mchart-leg">
            <span className="hn-leg-in">Inflow</span>
            <span className="hn-leg-out">Outflow</span>
          </div>
        </div>
        <svg viewBox="0 0 600 140" style={{ width: '100%', height: 140 }} fill="none">
          <path d="M0 80 C80 60, 120 50, 200 45 C280 40, 320 55, 400 40 C460 30, 520 20, 600 15" stroke="var(--accent)" strokeWidth="2" fill="none" />
          <path d="M0 80 C80 60, 120 50, 200 45 C280 40, 320 55, 400 40 C460 30, 520 20, 600 15 L600 140 L0 140Z" fill="rgba(110,103,255,0.06)" />
          <path d="M0 100 C80 95, 120 98, 200 90 C280 82, 320 88, 400 85 C460 83, 520 80, 600 78" stroke="var(--line-2)" strokeWidth="2" fill="none" />
          {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
            <text key={x} x={x === 0 ? 0 : x - 8} y={138} fill="var(--fg-4)" fontSize="10" fontFamily="var(--font-mono)">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function TourCashflow() {
  return (
    <div className="hn-tp-body">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Inflows this month</div>
          {[
            { src: 'Stripe MRR', amt: '$18,240', pct: 58 },
            { src: 'Consulting', amt: '$8,400', pct: 27 },
            { src: 'One-time', amt: '$4,810', pct: 15 },
          ].map(r => (
            <div key={r.src} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--fg-2)' }}>{r.src}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{r.amt}</span>
              </div>
              <div style={{ height: 4, background: 'var(--line)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: 'var(--accent)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Outflows this month</div>
          {[
            { src: 'Payroll', amt: '$14,200', pct: 62 },
            { src: 'SaaS tools', amt: '$3,840', pct: 17 },
            { src: 'Office & ops', amt: '$2,960', pct: 13 },
            { src: 'Other', amt: '$1,800', pct: 8 },
          ].map(r => (
            <div key={r.src} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--fg-2)' }}>{r.src}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{r.amt}</span>
              </div>
              <div style={{ height: 4, background: 'var(--line)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: 'rgba(255,127,137,0.7)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TourForecasts() {
  return (
    <div className="hn-tp-body">
      <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Conservative', months: '11.4 mo', color: 'rgba(255,127,137,0.8)' },
          { label: 'Base case', months: '14.2 mo', color: 'var(--accent-2)' },
          { label: 'Optimistic', months: '18.7 mo', color: 'rgba(127,229,184,0.8)' },
        ].map(s => (
          <div key={s.label} className="hn-mstat" style={{ borderColor: s.color.replace('0.8', '0.3') }}>
            <div className="hn-mlab">{s.label}</div>
            <div className="hn-mval" style={{ color: s.color }}>{s.months}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>runway</div>
          </div>
        ))}
      </div>
      <div className="hn-mchart">
        <div className="hn-mchart-head"><h4>12-month cash projection</h4></div>
        <svg viewBox="0 0 600 140" style={{ width: '100%', height: 130 }} fill="none">
          <line x1="0" y1="129" x2="600" y2="129" stroke="var(--line)" strokeWidth="1" />
          <path d="M0 40 C100 35, 200 28, 300 22 C400 16, 500 10, 600 5" stroke="rgba(127,229,184,0.5)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
          <path d="M0 40 C100 38, 200 35, 300 36 C400 37, 500 40, 600 45" stroke="var(--accent-2)" strokeWidth="2.5" fill="none" />
          <path d="M0 40 C100 42, 200 52, 300 65 C400 78, 500 95, 600 115" stroke="rgba(255,127,137,0.5)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
          <line x1="300" y1="0" x2="300" y2="130" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="3 4" />
          <text x="303" y="14" fill="var(--fg-4)" fontSize="10" fontFamily="var(--font-mono)">Today</text>
        </svg>
      </div>
    </div>
  )
}

function TourAsk() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'a', text: 'Hi! Ask me anything about your business finances.' }
  ])
  const [typing, setTyping] = useState(false)

  const CANNED: Record<string, string> = {
    'runway': 'At your current $22,800/mo burn rate, you have 14.2 months of runway. Your base case assumes flat expenses and 8% MoM revenue growth.',
    'revenue': 'Your MRR is $18,240, up 18.4% from last month. Stripe recurring subscriptions are driving 58% of total revenue.',
    'payroll': 'Payroll is $14,200 this month — your largest expense at 62% of total outflows. That\'s up $1,200 from last month due to 2 new hires.',
  }

  const send = useCallback(() => {
    const q = input.trim()
    if (!q) return
    setMessages(m => [...m, { role: 'u', text: q }])
    setInput('')
    setTyping(true)
    const key = Object.keys(CANNED).find(k => q.toLowerCase().includes(k))
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { role: 'a', text: key ? CANNED[key] : 'Great question. Based on your last 90 days of data, here\'s what I see...' }])
    }, 900)
  }, [input])

  return (
    <div className="hn-tp-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 340 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            maxWidth: '80%',
            alignSelf: m.role === 'u' ? 'flex-end' : 'flex-start',
            padding: '10px 14px',
            borderRadius: m.role === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: m.role === 'u' ? 'rgba(110,103,255,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${m.role === 'u' ? 'rgba(110,103,255,0.3)' : 'var(--line)'}`,
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--fg)',
          }}>{m.text}</div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', display: 'flex', gap: 4, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-3)', display: 'block', animation: 'hn-pulse 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={"Try \"What's my runway?\" or \"Show me payroll\""}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 100,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
            color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button onClick={send} style={{
          padding: '10px 16px', borderRadius: 100, background: 'var(--accent)',
          color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
          cursor: 'pointer', border: 'none',
        }}>Send</button>
      </div>
    </div>
  )
}

const TOUR_CONTENT: Record<string, React.ReactNode> = {
  overview: <TourOverview />,
  cashflow: <TourCashflow />,
  forecasts: <TourForecasts />,
  ask: <TourAsk />,
}

const TOUR_TITLES: Record<string, string> = {
  overview: 'Business Overview',
  cashflow: 'Cash Flow',
  forecasts: 'Runway Forecasts',
  ask: 'Ask FlowDesk',
}

/* ── Main page ── */
export default function Home() {
  const screenSize = useScreenSize()
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const [metaVisible, setMetaVisible] = useState(false)
  const metaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = metaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setMetaVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const c1 = useCounter(2400, metaVisible)
  const c2 = useCounter(98, metaVisible)
  const c3 = useCounter(14, metaVisible)

  const r1 = useReveal()
  const r2 = useReveal()
  const r3 = useReveal()
  const r4 = useReveal()
  const r5 = useReveal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="home-page">
      {/* ── Nav ── */}
      <nav className={`hn-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="hn-nav-inner">
          <a href="/" className="hn-logo">
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#4F46FF',
              boxShadow: '0 0 10px rgba(79,70,255,0.9)',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            FlowDesk
          </a>
          <div className="hn-nav-links">
            <a href="#features">Features</a>
            <a href="#tour">Product</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="hn-nav-right">
            <a href="/sign-in" className="hn-btn hn-btn-ghost">Sign in</a>
            <a href="/create-account" className="hn-btn hn-btn-primary">Get started free →</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hn-hero">
        {/* Video background */}
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '-20%', left: 0,
            width: '100%', height: '120%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.9,
          }}
        >
          <source src="https://mybycketvercelprojecttest.s3.sa-east-1.amazonaws.com/animation-bg.mp4" type="video/mp4" />
        </video>

        {/* Thin scrim so text stays readable — much lighter than before */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'rgba(9,7,26,0.22)',
          pointerEvents: 'none',
        }} />

        {/* Purple gradient washes */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(79,70,255,0.35), transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom left, rgba(79,70,255,0.2), transparent)' }} />
        </div>

        {/* Pixel trail gooey effect */}
        <GooeyFilter id="hero-pixel-goo" strength={3} />
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 20, filter: 'url(#hero-pixel-goo)' }}
        >
          <PixelTrail
            pixelSize={screenSize.lessThan('md') ? 36 : 48}
            fadeDuration={0}
            delay={600}
            pixelClassName="bg-indigo-400"
          />
        </div>

        <div className="hn-container hn-hero-content">
          <>
              <h1 className="hn-hero-headline" style={{ textAlign: 'center' }}>
                <span className="hn-line">
                  <ShutterText text="Know your" baseDelay={0} />
                </span>
                <span className="hn-line">
                  <ShutterText text="numbers." baseDelay={0.38} className="hn-serif" />
                </span>
                <span className="hn-line hn-dim">
                  <ShutterText text="Run better." baseDelay={0.72} />
                </span>
              </h1>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, position: 'relative', zIndex: 30 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href="/create-account" className="hn-btn hn-btn-primary hn-cta-btn">Start free — no card needed</a>
                  <a href="#tour" className="hn-btn hn-btn-outline hn-cta-btn">See how it works</a>
                </div>
              </div>
          </>

          {/* Meta bar */}
          <div className="hn-meta-bar" ref={metaRef}>
            <div>
              <div className="hn-k">Businesses using FlowDesk</div>
              <div className="hn-v"><span className="hn-num">{c1.toLocaleString()}+</span></div>
            </div>
            <div>
              <div className="hn-k">Forecast accuracy</div>
              <div className="hn-v"><span className="hn-num">{c2}%</span> at 90 days</div>
            </div>
            <div>
              <div className="hn-k">Avg. time to first insight</div>
              <div className="hn-v">Under <span className="hn-num">{c3}</span> minutes</div>
            </div>
            <div>
              <div className="hn-k">Data sources connected</div>
              <div className="hn-v"><span className="hn-num">Stripe, QB, Xero, Plaid</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="hn-problem">
        <div className="hn-container">
          <div className="hn-problem-grid">
            <div className="hn-problem-left reveal" ref={r1}>
              <div className="hn-tag">The problem</div>
              <h2>
                Running blind <br />
                costs <span className="hn-serif">more</span> <br />
                than you think.
              </h2>
            </div>
            <div className="hn-problem-right reveal" ref={r2}>
              {[
                { n: '01', text: <>You check your bank balance, not your <span className="hn-dim">cash flow.</span> There's a difference — and it matters.</> },
                { n: '02', text: <>Your accountant is three months behind. By the time you see the numbers, <span className="hn-dim">the moment has passed.</span></> },
                { n: '03', text: <>You've built forecasts in spreadsheets that broke the moment <span className="hn-dim">reality diverged from the plan.</span></> },
              ].map(p => (
                <div key={p.n} className="hn-pain">
                  <span className="hn-n">{p.n}</span>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="hn-features" id="features">
        <div className="hn-container">
          <div className="hn-features-head reveal" ref={r3}>
            <div className="left">
              <div className="hn-tag">What you get</div>
              <h2>
                Everything<br />
                a <span className="hn-serif">CFO</span> would<br />
                build for you.
              </h2>
            </div>
            <div className="right">
              <p>Six interconnected views of your business finances — built for the operator, not the analyst. No training required.</p>
            </div>
          </div>
          <div className="hn-feat-grid">
            {FEATURES.map(f => (
              <div key={f.num} className="hn-feat">
                <div className="hn-feat-num">{f.num}</div>
                <div className="hn-feat-name">{f.name}</div>
                <div className="hn-feat-desc">{f.desc}</div>
                <div className="hn-feat-viz">{f.viz}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Tour ── */}
      <section className="hn-tour" id="tour">
        <div className="hn-container">
          <div className="hn-tour-head reveal" ref={r4}>
            <div className="l">
              <div className="hn-tag">Product tour</div>
              <h2>
                See your business<br />
                the way it <span className="hn-serif">actually is.</span>
              </h2>
            </div>
          </div>
          <div className="hn-tour-body">
            <div className="hn-tour-tabs">
              {TOUR_TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`hn-tour-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="hn-tab-n">{tab.n}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="hn-tour-screen">
              <div className="hn-tp-head">
                <span className="hn-tp-crumb">FlowDesk</span>
                <span>›</span>
                <span className="hn-tp-title">{TOUR_TITLES[activeTab]}</span>
              </div>
              {TOUR_TABS.map(tab => (
                <div key={tab.id} className={`hn-tpanel${activeTab === tab.id ? ' active' : ''}`}>
                  {TOUR_CONTENT[tab.id]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hn-faq" id="faq">
        <div className="hn-container">
          <div className="hn-faq-grid">
            <div className="hn-faq-head reveal" ref={r5}>
              <div className="hn-tag">FAQ</div>
              <h2>
                Questions<br />
                we get <span className="hn-serif">often.</span>
              </h2>
              <p>Don't see yours? Email us at hello@flowdesk.co — we reply fast.</p>
            </div>
            <div className="hn-faq-list">
              {FAQS.map((faq, i) => (
                <div key={i} className={`hn-faq-item${openFaq === i ? ' open' : ''}`}>
                  <button className="hn-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q}
                    <span className="hn-faq-sign">+</span>
                  </button>
                  <div className="hn-faq-a">
                    <div className="hn-faq-a-inner">
                      <div className="hn-faq-a-pad">{faq.a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="hn-cta-end">
        <div className="hn-container">
          <div className="hn-cta-inner">
            <div className="hn-tag" style={{ textAlign: 'center', marginBottom: 40 }}>Get started today</div>
            <h2>
              Stop guessing.<br />
              Start <span className="hn-serif">knowing.</span>
            </h2>
            <p>Connect your accounts in minutes. Get your first insight before lunch.</p>
            <div className="hn-cta-actions">
              <a href="/create-account" className="hn-btn hn-btn-primary hn-cta-lg">Start free — no card needed</a>
              <a href="#tour" className="hn-btn hn-btn-outline hn-cta-lg">See a demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hn-footer">
        <div className="hn-container">
          <div className="hn-foot-grid">
            <div>
              <div className="hn-foot-logo">
                <span className="hn-logo-mark" style={{ width: 20, height: 20, fontSize: 11 }}>F</span>
                FlowDesk
              </div>
              <p style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-3)', maxWidth: '30ch', lineHeight: 1.6 }}>
                Financial intelligence for businesses that can't afford to guess.
              </p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#tour">Product tour</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/changelog">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/terms">Terms</a></li>
                <li><a href="/security">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="hn-foot-bottom">
            <span>© 2026 FlowDesk Inc. All rights reserved.</span>
            <span>Made with care for small business owners.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
