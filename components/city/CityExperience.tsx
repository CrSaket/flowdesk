'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import HUD from './HUD'
import CursorTrail from './CursorTrail'

const CityCanvas = dynamic(
  () => import('./CityCanvas').then(m => ({ default: m.CityCanvas })),
  { ssr: false, loading: () => <CityLoadingShimmer /> }
)

// ─── Zone definitions ─────────────────────────────────────────────────────────
const ZONES = [
  {
    title: 'Know your\nBusiness Operations',
    subtitle: 'Skyline Panorama',
    body: 'Real-time cash flow, runway forecasting, and operations — explained in plain English. No spreadsheets. No data team.',
    cta: { label: 'Start Free Trial', href: '#pricing' },
    ctaSecondary: { label: 'See how it works', href: '#pricing' },
    stat: 'No credit card required · 14-day free trial',
    mockup: 'overview',
  },
  {
    title: 'Designed for speed,\nnot complexity',
    subtitle: 'Financial District',
    body: 'Instant insights from your accounting software, bank feeds, and invoices. FlowDesk turns raw numbers into clear decisions.',
    stat: 'Setup in under 5 minutes',
    mockup: 'transactions',
  },
  {
    title: 'Live business\nintelligence',
    subtitle: 'Data Tower',
    body: 'Track cash runway, burn rate, and revenue in real time. Your dashboard updates automatically as transactions arrive.',
    stat: 'Data refreshed every 60 seconds',
    mockup: 'analytics',
  },
  {
    title: 'Works with your\nwhole stack',
    subtitle: 'Bridge District',
    body: 'Connects to QuickBooks, Xero, Stripe, Plaid, and 200+ tools you already use. No manual exports required.',
    stat: '200+ integrations available',
    mockup: 'integrations',
  },
  {
    title: 'Your business runs on\ndata. Time to use it.',
    subtitle: 'Rooftop Observatory',
    body: 'Start your free 14-day trial. No credit card required. Cancel anytime.',
    cta: { label: 'Start Free Trial', href: '#pricing' },
    ctaSecondary: { label: 'Talk to Sales', href: '#' },
    stat: 'Join 47,000+ businesses already using FlowDesk',
    mockup: 'success',
  },
] as const

// ─── Per-zone FlowDesk mockups ────────────────────────────────────────────────

function MockupShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 640,
      borderRadius: 24,
      border: '1px solid var(--color-border)',
      background: 'linear-gradient(180deg, rgba(20,17,40,0.97) 0%, rgba(13,11,30,0.98) 100%)',
      boxShadow: '0 36px 100px rgba(0,0,0,0.6), 0 0 64px rgba(79,70,255,0.15)',
      overflow: 'hidden',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 48,
        padding: '0 20px', borderBottom: '1px solid var(--color-border)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F56', flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD2E', flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27C93F', flexShrink: 0 }} />
        <span style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
          flowdesk.app — {title}
        </span>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

function MockupOverview() {
  const kpis = [
    { label: 'Revenue', value: '$84.2K', delta: '+24%', tone: 'var(--color-success)' },
    { label: 'Burn Rate', value: '$18.6K', delta: '-6%', tone: 'var(--color-success)' },
    { label: 'Runway', value: '4.8 mo', delta: '+0.7', tone: 'var(--color-warning)' },
  ]
  const bars = [34, 72, 48, 91, 63, 100, 56]
  return (
    <MockupShell title="Overview">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ padding: 18, borderRadius: 16, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.tone }}>{k.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 20, borderRadius: 18, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Cash flow</span>
          <span style={{ fontSize: 12, color: 'var(--color-success)', background: 'rgba(0,229,160,0.08)', padding: '4px 10px', borderRadius: 99 }}>Healthy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg, rgba(79,70,255,${0.3 + (h/100)*0.6}) 0%, rgba(79,70,255,0.1) 100%)`, borderRadius: '4px 4px 0 0', border: '1px solid rgba(79,70,255,0.3)', borderBottom: 'none' }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {[
          { label: 'Cash runway', value: '4.8 mo', color: 'var(--color-success)' },
          { label: 'Invoices due', value: '7 open', color: 'var(--color-warning)' },
          { label: 'Team capacity', value: '82%', color: 'var(--color-accent-light)' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{r.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>
    </MockupShell>
  )
}

function MockupTransactions() {
  const txns = [
    { name: 'Stripe payout',       amt: '+$12,400', date: 'Today',    type: 'income' },
    { name: 'AWS infrastructure',   amt: '-$2,340',  date: 'Today',    type: 'expense' },
    { name: 'QuickBooks sync',      amt: '—',        date: 'Today',    type: 'system' },
    { name: 'Payroll — Apr',        amt: '-$38,200', date: 'Apr 12',   type: 'expense' },
    { name: 'Enterprise contract',  amt: '+$24,000', date: 'Apr 11',   type: 'income' },
    { name: 'Plaid reconnected',    amt: '—',        date: 'Apr 10',   type: 'system' },
  ]
  return (
    <MockupShell title="Transactions">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Recent activity</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent)', letterSpacing: '0.12em' }}>● LIVE</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {txns.map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: 14, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: t.type === 'income' ? 'var(--color-success)' : t.type === 'expense' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                boxShadow: t.type === 'income' ? '0 0 8px rgba(0,229,160,0.7)' : t.type === 'expense' ? '0 0 8px rgba(255,107,107,0.6)' : 'none',
              }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{t.date}</div>
              </div>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: t.type === 'income' ? 'var(--color-success)' : t.type === 'expense' ? 'var(--color-danger)' : 'var(--color-text-muted)',
            }}>{t.amt}</span>
          </div>
        ))}
      </div>
    </MockupShell>
  )
}

function MockupAnalytics() {
  const metrics = [
    { label: 'MRR', value: '$48.2K', trend: '+18%' },
    { label: 'ARR', value: '$578K',  trend: '+22%' },
    { label: 'Churn', value: '1.2%', trend: '-0.3%' },
  ]
  const sparkline = [40, 55, 48, 72, 64, 88, 76, 95, 84, 100, 91, 100]
  const maxS = Math.max(...sparkline)
  return (
    <MockupShell title="Analytics">
      <div style={{ marginBottom: 18, padding: 20, borderRadius: 18, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>Net Revenue</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--color-text-primary)' }}>$84,200</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 4 }}>▲ 24% vs last month</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>Updated 2m ago</div>
          </div>
        </div>
        {/* Sparkline */}
        <svg viewBox={`0 0 ${sparkline.length * 10} 50`} style={{ width: '100%', height: 72, overflow: 'visible' }}>
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79,70,255,0.45)" />
              <stop offset="100%" stopColor="rgba(79,70,255,0)" />
            </linearGradient>
          </defs>
          <path
            d={`M${sparkline.map((v, i) => `${i * 10},${50 - (v / maxS) * 44}`).join(' L')}`}
            fill="none" stroke="#4F46FF" strokeWidth="2" strokeLinejoin="round"
          />
          <path
            d={`M0,50 L${sparkline.map((v, i) => `${i * 10},${50 - (v / maxS) * 44}`).join(' L')} L${(sparkline.length - 1) * 10},50 Z`}
            fill="url(#sg)"
          />
          <circle cx={(sparkline.length - 1) * 10} cy={50 - (sparkline[sparkline.length - 1] / maxS) * 44} r="4" fill="#4F46FF" />
        </svg>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 5 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-success)' }}>{m.trend}</div>
          </div>
        ))}
      </div>
    </MockupShell>
  )
}

function MockupIntegrations() {
  const integrations = [
    { name: 'Stripe',      color: '#6772E5', connected: true  },
    { name: 'QuickBooks',  color: '#2CA01C', connected: true  },
    { name: 'Xero',        color: '#00B2E3', connected: true  },
    { name: 'Plaid',       color: '#00C5E0', connected: true  },
    { name: 'Salesforce',  color: '#00A1E0', connected: false },
    { name: 'HubSpot',     color: '#FF7A59', connected: false },
    { name: 'Slack',       color: '#4A154B', connected: true  },
    { name: 'Notion',      color: '#FFFFFF', connected: false },
  ]
  return (
    <MockupShell title="Integrations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Connected apps</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>5 active</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {integrations.map(ig => (
          <div key={ig.name} style={{
            padding: '16px 10px',
            borderRadius: 16,
            background: 'var(--color-bg-overlay)',
            border: `1px solid ${ig.connected ? 'rgba(0,229,160,0.25)' : 'var(--color-border)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: ig.color + '22', border: `1px solid ${ig.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: ig.color }}>{ig.name[0]}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{ig.name}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ig.connected ? 'var(--color-success)' : 'var(--color-border)', boxShadow: ig.connected ? '0 0 7px rgba(0,229,160,0.7)' : 'none' }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px rgba(0,229,160,0.8)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>All data streams synced</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>1m ago</span>
      </div>
    </MockupShell>
  )
}

function MockupSuccess() {
  const testimonials = [
    { text: 'Cut our monthly close from 5 days to 4 hours.', name: 'Sarah K.', role: 'CFO, Finsync' },
    { text: 'Finally understand our burn rate without a data team.', name: 'Mark R.', role: 'CEO, Buildstack' },
    { text: 'Best $99 we spend every month, no question.', name: 'Priya M.', role: 'COO, Lumen Health' },
  ]
  return (
    <MockupShell title="Success Stories">
      <div style={{ textAlign: 'center', marginBottom: 20, padding: '18px 0 12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 400, color: 'var(--color-success)', marginBottom: 6 }}>
          47,283
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>businesses served globally</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 10 }}>
          {'★★★★★'.split('').map((s, i) => (
            <span key={i} style={{ color: 'var(--color-warning)', fontSize: 20 }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 5 }}>4.9 / 5.0 average rating</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0, marginBottom: 10 }}>"{t.text}"</p>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.name} · {t.role}</div>
          </div>
        ))}
      </div>
    </MockupShell>
  )
}

const MOCKUP_MAP = {
  overview:     MockupOverview,
  transactions: MockupTransactions,
  analytics:    MockupAnalytics,
  integrations: MockupIntegrations,
  success:      MockupSuccess,
}

// ─── Visibility helpers ───────────────────────────────────────────────────────
function getZoneVisibility(progress: number, zoneIdx: number): number {
  const zoneStart = zoneIdx * 0.2
  const zoneEnd   = zoneStart + 0.2
  const MARGIN    = 0.04
  if (progress < zoneStart - MARGIN || progress > zoneEnd + MARGIN) return 0
  if (progress < zoneStart + MARGIN) return (progress - (zoneStart - MARGIN)) / (MARGIN * 2)
  if (progress > zoneEnd   - MARGIN) return 1 - (progress - (zoneEnd - MARGIN)) / (MARGIN * 2)
  return 1
}

// ─── Zone overlay ─────────────────────────────────────────────────────────────
interface ZoneContentProps {
  zone: typeof ZONES[number]
  zoneIdx: number
  scrollRef: { current: number }
}

function ZoneContent({ zone, zoneIdx, scrollRef }: ZoneContentProps) {
  const [opacity, setOpacity] = useState(zoneIdx === 0 ? 1 : 0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const tick = () => {
      setOpacity(getZoneVisibility(scrollRef.current, zoneIdx))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [scrollRef, zoneIdx])

  if (opacity < 0.005) return null

  const titleLines = zone.title.split('\n')
  const MockupComponent = MOCKUP_MAP[zone.mockup]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 56px 0 56px',
        zIndex: 2,
        opacity,
        transition: 'opacity 0.08s linear',
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
        gap: 32,
      }}
    >
      {/* ── Left: text content ── */}
      <div style={{ flex: '0 0 380px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 18, opacity: 0.8 }}>
          {zone.subtitle}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4.2vw, 3.6rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', margin: 0, textShadow: '0 0 40px rgba(79,70,255,0.25)' }}>
          {titleLines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {i === 1 ? <span style={{ color: 'var(--color-accent-light)' }}>{line}</span> : line}
            </span>
          ))}
        </h2>

        <p style={{ marginTop: 20, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.7, color: 'var(--color-text-secondary)', maxWidth: 420 }}>
          {zone.body}
        </p>

        {'cta' in zone && zone.cta && (
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={zone.cta.href} className="gradient-button" style={{ padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {zone.cta.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            {'ctaSecondary' in zone && zone.ctaSecondary && (
              <a href={zone.ctaSecondary.href} style={{ padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}>
                {zone.ctaSecondary.label}
              </a>
            )}
          </div>
        )}

        {'stat' in zone && zone.stat && (
          <div style={{ marginTop: 18, fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 8px rgba(79,70,255,0.8)', flexShrink: 0, display: 'inline-block' }} />
            {zone.stat}
          </div>
        )}
      </div>

      {/* ── Right: FlowDesk mockup ── */}
      <div style={{
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 0,
        maxWidth: 660,
      }}>
        <MockupComponent />
      </div>
    </div>
  )
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function CityLoadingShimmer() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-base)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(79,70,255,0.04) 50%, transparent 100%)', animation: 'shimmer 2s ease-in-out infinite' }} />
    </div>
  )
}

// ─── Reduced motion fallback ──────────────────────────────────────────────────
function ReducedMotionFallback() {
  return (
    <div style={{ background: 'var(--color-bg-base)' }}>
      {ZONES.map((zone, i) => (
        <section key={i} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', padding: '80px 64px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16, opacity: 0.7 }}>{zone.subtitle}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', margin: 0 }}>{zone.title.replace('\n', ' ')}</h2>
            <p style={{ marginTop: 20, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{zone.body}</p>
            {'cta' in zone && zone.cta && (
              <a href={zone.cta.href} className="gradient-button" style={{ marginTop: 28, padding: '13px 26px', borderRadius: 100, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>{zone.cta.label}</a>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CityExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReduced) return
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const scrollable = el.offsetHeight - window.innerHeight
      const scrolled   = window.scrollY - el.offsetTop
      scrollRef.current = Math.max(0, Math.min(1, scrolled / scrollable))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [prefersReduced])

  if (!isMounted) return null
  if (prefersReduced) return <ReducedMotionFallback />

  return (
    <div ref={containerRef} style={{ height: '500vh', position: 'relative', scrollSnapType: 'y proximity' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: 'var(--color-bg-base)' }}>
        <CityCanvas scrollRef={scrollRef} />
        <CursorTrail />
        {ZONES.map((zone, i) => (
          <ZoneContent key={i} zone={zone} zoneIdx={i} scrollRef={scrollRef} />
        ))}
        <HUD scrollRef={scrollRef} />
        <ScrollHint scrollRef={scrollRef} />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ position: 'absolute', top: `${i * 20}%`, scrollSnapAlign: 'start' }} />
      ))}
    </div>
  )
}

function ScrollHint({ scrollRef }: { scrollRef: { current: number } }) {
  const [visible, setVisible] = useState(true)
  const rafRef = useRef<number>()
  useEffect(() => {
    const tick = () => {
      setVisible(scrollRef.current < 0.08)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [scrollRef])
  return (
    <div aria-hidden="true" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 4, opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease-out', pointerEvents: 'none' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Scroll to explore</span>
      <div style={{ position: 'relative', width: 22, height: 36, border: '1.5px solid rgba(79,70,255,0.4)', borderRadius: 11 }}>
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 4, height: 8, background: 'var(--color-accent)', borderRadius: 2, animation: 'scrollDot 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
