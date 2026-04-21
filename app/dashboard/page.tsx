'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  TrendingUp, TrendingDown, Users, DollarSign, Zap,
  AlertTriangle, CheckCircle, ArrowRight, Database, Activity,
  Brain, Bot, BarChart2, Target, Headphones, Search, Star,
  Shield, PieChart, DollarSign as Money, Microscope,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import type { TrainResult } from '@/lib/api'
import { getAgentActivity, type AgentActivityEntry } from '@/lib/agents'
import { getAgentAnalytics, type AgentAnalyticsSeries } from '@/lib/agent-analytics'
import SystemMonitor from '@/components/ui/system-monitor'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColor = { good: '#00E5A0', warn: '#FFC85C', bad: '#FF6B6B' }
const statusLabel = { good: 'Healthy', warn: 'Warning', bad: 'Critical' }

function StatusDot({ s }: { s: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: statusColor[s as keyof typeof statusColor] }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: statusColor[s as keyof typeof statusColor],
        boxShadow: `0 0 6px ${statusColor[s as keyof typeof statusColor]}`,
        display: 'inline-block',
        animation: 'dot-pulse 2s ease-in-out infinite',
      }} />
      {statusLabel[s as keyof typeof statusLabel]}
    </span>
  )
}

function Skeleton({ w = '100%', h = 18, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.6s ease-in-out infinite' }} />
}

// ── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon: Icon, label, value, sub, trend, trendUp, accent, delay = 0,
}: {
  icon: any; label: string; value: string; sub: string
  trend: string; trendUp: boolean; accent?: string; delay?: number
}) {
  const color = accent ?? '#4F46FF'
  return (
    <motion.div
      whileHover={{ y: -2, borderColor: `${color}30` }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 12,
        padding: '16px 18px',
        background: 'rgba(15,17,23,0.97)',
        border: '1px solid var(--color-border)',
        position: 'relative',
        animation: `page-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
        cursor: 'default',
      }}
    >
      {/* Icon in top-right corner */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 26, height: 26, borderRadius: 7,
        background: `${color}18`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={13} style={{ color }} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </div>

      <div style={{
        fontSize: 26, fontFamily: 'var(--font-mono)', fontWeight: 700,
        color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 5,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginBottom: 10 }}>{sub}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: trendUp ? '#00E5A0' : '#FF6B6B' }}>
        {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {trend}
      </div>
    </motion.div>
  )
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function computeHealthScore(trainResult: TrainResult | null, goal: string | null) {
  if (!trainResult) return { overall: 62, financial: 68, customer: 71, marketing: 55, operations: 58 }
  const accuracy = trainResult.accuracy
  const isChurn = goal === 'churn_risk'
  const isSales = goal === 'sales_forecast'
  const financial = isSales ? Math.min(97, Math.round(accuracy * 0.88 + 6)) : 70
  let customer = 74
  if (isChurn && trainResult.high_risk_count != null && (trainResult.customers_scored ?? 1) > 0) {
    const riskPct = (trainResult.high_risk_count ?? 0) / (trainResult.customers_scored ?? 1) * 100
    customer = Math.max(12, Math.round(100 - riskPct * 1.8))
  }
  const operations = Math.min(97, Math.round(accuracy * 0.92))
  const overall = Math.min(98, Math.round(financial * 0.28 + customer * 0.3 + 55 * 0.18 + operations * 0.24))
  return { overall, financial, customer, operations }
}

// ── Business Performance Chart (with dropdown) ───────────────────────────────
type ChartMode = 'predictions' | 'agent_activity' | 'shap' | 'model_health'

const CHART_MODES: { key: ChartMode; label: string; icon: any; href: string }[] = [
  { key: 'predictions',    label: 'Sales / Churn Forecast', icon: TrendingUp, href: '/dashboard/predictions'    },
  { key: 'agent_activity', label: 'Agent Activity',          icon: Bot,        href: '/dashboard/agents'         },
  { key: 'shap',           label: 'Top SHAP Drivers',        icon: Brain,      href: '/dashboard/explainability' },
  { key: 'model_health',   label: 'Model Health',            icon: Activity,   href: '/dashboard/health'         },
]

function PerformanceChart({
  barData, insightText, shapData, metricsData, agentDailyTotal,
}: {
  barData: { label: string; value: number }[]
  insightText: string
  shapData: TrainResult['shap_global']
  metricsData: { accuracy?: number; mae?: number; rmse?: number; r2?: number; auc?: number }
  agentDailyTotal: { label: string; runs: number }[]
}) {
  const [mode, setMode] = useState<ChartMode>('predictions')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const maxVal = Math.max(...barData.map(d => d.value), 1)
  const currentMode = CHART_MODES.find(m => m.key === mode)!

  const RoundedBar = (props: any) => {
    const { x, y, width, height, fill } = props
    if (!height || height <= 0) return null
    const radius = Math.min(5, width / 2)
    return <path d={`M${x + radius},${y} h${width - 2 * radius} a${radius},${radius} 0 0 1 ${radius},${radius} v${height - radius} h-${width} v-${height - radius} a${radius},${radius} 0 0 1 ${radius},-${radius}z`} fill={fill} />
  }

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '22px 24px 0',
      animation: 'page-enter 0.45s cubic-bezier(0.22,1,0.36,1) 0.22s both',
      position: 'relative',
    }}>
      {/* Header with dropdown */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>
            Business Performance Rhythm
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Understanding when your metrics peak
          </div>
        </div>

        {/* Dropdown selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,70,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(79,70,255,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
          >
            <currentMode.icon size={12} style={{ color: 'var(--color-accent-light)' }} />
            {currentMode.label}
            <ChevronDown size={11} style={{ marginLeft: 2 }} />
          </button>

          <AnimatePresence>
          {dropdownOpen && (
            <>
              <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                  borderRadius: 10, padding: 4, zIndex: 20, minWidth: 220,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transformOrigin: 'top right',
                }}
              >
                {CHART_MODES.map(m => {
                  const Icon = m.icon
                  return (
                    <button
                      key={m.key}
                      onClick={() => { setMode(m.key); setDropdownOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        background: mode === m.key ? 'rgba(79,70,255,0.12)' : 'transparent',
                        color: mode === m.key ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        fontSize: 12.5, fontWeight: mode === m.key ? 600 : 500,
                        textAlign: 'left', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (mode !== m.key) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (mode !== m.key) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <Icon size={13} />
                      {m.label}
                    </button>
                  )
                })}
                <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 8px' }} />
                <Link href={currentMode.href} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, color: 'var(--color-accent-light)', textDecoration: 'none' }}>
                  Open full view <ArrowRight size={10} />
                </Link>
              </motion.div>
            </>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Chart content based on mode ── */}

      {/* Predictions / churn bar chart */}
      {mode === 'predictions' && (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip cursor={{ fill: 'rgba(79,70,255,0.05)' }} contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [v, 'Value']} />
            <Bar dataKey="value" shape={<RoundedBar />} radius={[5, 5, 0, 0]}>
              {barData.map((entry, i) => {
                const intensity = entry.value / maxVal
                return <Cell key={i} fill={intensity > 0.7 ? '#4F46FF' : intensity > 0.4 ? 'rgba(79,70,255,0.7)' : 'rgba(79,70,255,0.35)'} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Agent activity area chart */}
      {mode === 'agent_activity' && (
        agentDailyTotal.some(d => d.runs > 0) ? (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={agentDailyTotal} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="agGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} hide />
              <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [v, 'Agent Runs']} />
              <Area type="monotone" dataKey="runs" stroke="#00E5A0" strokeWidth={2} fill="url(#agGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
            <Bot size={24} style={{ opacity: 0.3 }} />
            Run agents from the Agents tab to see activity here
          </div>
        )
      )}

      {/* SHAP drivers horizontal bars */}
      {mode === 'shap' && (
        shapData && shapData.length > 0 ? (
          <div style={{ height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
            {shapData.slice(0, 5).map((f, i) => (
              <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: 140, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.importance}%`, background: f.raw >= 0 ? '#00E5A0' : '#FF6B6B', borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: f.raw >= 0 ? '#00E5A0' : '#FF6B6B', minWidth: 36, textAlign: 'right' }}>{f.importance}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>Train a model to see SHAP feature importances</div>
        )
      )}

      {/* Model health metrics */}
      {mode === 'model_health' && (
        (metricsData.accuracy != null || metricsData.auc != null || metricsData.mae != null) ? (
          <div style={{ height: 160, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Accuracy', value: metricsData.accuracy != null ? `${metricsData.accuracy.toFixed(1)}%` : null, color: '#00E5A0' },
              { label: 'AUC-ROC',  value: metricsData.auc != null ? metricsData.auc.toFixed(3) : null, color: '#4F46FF' },
              { label: 'MAE',      value: metricsData.mae != null ? `$${metricsData.mae.toFixed(0)}` : null, color: '#FFC85C' },
              { label: 'R² Score', value: metricsData.r2 != null ? metricsData.r2.toFixed(3) : null, color: '#9B8BFF' },
              { label: 'RMSE',     value: metricsData.rmse != null ? `$${metricsData.rmse.toFixed(0)}` : null, color: '#60A5FA' },
            ].filter(m => m.value != null).map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: m.color, letterSpacing: '-0.02em' }}>{m.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>Train a model to see health metrics</div>
        )
      )}

      {/* AI Insight callout */}
      <div style={{
        margin: '0 -24px',
        padding: '13px 24px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.015)',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#00E5A0',
          boxShadow: '0 0 8px rgba(0,229,160,0.6)',
          flexShrink: 0,
          animation: 'dot-pulse 2.5s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{insightText}</span>
      </div>
    </div>
  )
}

// ── Agent icon mapping (emoji → Lucide) ─────────────────────────────────────
const AGENT_ICON_MAP: Record<string, LucideIcon> = {
  '🎯': Target, '🎧': Headphones, '🔍': Search, '⭐': Star,
  '🛡️': Shield, '📊': BarChart2, '💰': DollarSign, '🔬': Microscope,
  '📈': TrendingUp, '📉': TrendingDown, '🤖': Bot, '🧠': Brain,
  '👥': Users, '⚙️': Zap, '📧': Activity, '📦': Database,
  '💼': BarChart2,
}
function AgentIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = AGENT_ICON_MAP[icon] ?? Bot
  return <Icon size={13} style={{ color }} />
}

// ── Agent Activity Feed ───────────────────────────────────────────────────────
const FALLBACK_ACTIVITIES = [
  { agent: 'Marketing Agent', icon: '🎯', action: 'Drafted 3 social posts for Instagram & LinkedIn', time: '2m ago', status: 'done', color: '#4F46FF' },
  { agent: 'CX Agent', icon: '🎧', action: 'Resolved 8 customer inquiries, escalated 1', time: '5m ago', status: 'done', color: '#00E5A0' },
  { agent: 'SEO Agent', icon: '🔍', action: 'Identified 5 high-opportunity, low-competition keywords', time: '18m ago', status: 'done', color: '#34D399' },
  { agent: 'Reputation Agent', icon: '⭐', action: 'Monitored Google & Yelp — no new reviews', time: '32m ago', status: 'idle', color: '#FFD700' },
  { agent: 'Compliance Agent', icon: '🛡️', action: 'No compliance issues detected this week', time: '1h ago', status: 'done', color: '#60A5FA' },
]

type FeedItem = { agent: string; icon: string; action: string; time: string; status: string; color: string; href?: string }

function AgentActivityFeed({ modelItems }: { modelItems: FeedItem[] }) {
  const [liveItems, setLiveItems] = useState<AgentActivityEntry[]>([])

  useEffect(() => {
    getAgentActivity(10).then(d => setLiveItems(d)).catch(() => {})
  }, [])

  const allItems: FeedItem[] = [
    ...liveItems.map(e => ({ agent: e.agent, icon: e.icon, action: e.action, time: e.time, status: e.status, color: e.color })),
    ...modelItems,
    ...FALLBACK_ACTIVITIES,
  ]
  const seen = new Set<string>()
  const items = allItems.filter(item => {
    const key = `${item.agent}:${item.action.slice(0, 40)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 5)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Agent Activity</div>
        <Link
          href="/dashboard/agents"
          style={{ fontSize: 11.5, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, transition: 'gap 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.gap = '5px')}
          onMouseLeave={e => (e.currentTarget.style.gap = '3px')}
        >
          All agents <ArrowRight size={11} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((a, i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: '11px 14px',
              transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), border-color 0.18s, background 0.18s',
              animation: `page-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.05}s both`,
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(3px)'
              e.currentTarget.style.borderColor = 'rgba(79,70,255,0.25)'
              e.currentTarget.style.background = 'var(--color-bg-elevated)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.background = 'var(--color-bg-surface)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: `${a.color}15`,
                border: `1px solid ${a.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AgentIcon icon={a.icon} color={a.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: a.color }}>{a.agent}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: a.status === 'done' ? '#00E5A0' : a.status === 'alert' ? '#FF6B6B' : 'var(--color-text-muted)',
                    background: a.status === 'done' ? 'rgba(0,229,160,0.1)' : a.status === 'alert' ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${a.status === 'done' ? 'rgba(0,229,160,0.22)' : a.status === 'alert' ? 'rgba(255,107,107,0.22)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 4, padding: '1px 5px',
                  }}>
                    {a.status === 'done' ? 'done' : a.status === 'alert' ? 'alert' : 'idle'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.action}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{a.time}</span>
              {a.href && (
                <Link href={a.href} style={{ fontSize: 10, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  View <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Active Model Panel ────────────────────────────────────────────────────────
function ModelPanel({ trainResult, goal }: { trainResult: TrainResult; goal: string | null }) {
  const isSales = goal === 'sales_forecast'
  const scores = computeHealthScore(trainResult, goal)

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      animation: 'page-enter 0.4s cubic-bezier(0.22,1,0.36,1) 0.22s both',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {isSales ? 'Sales Forecast' : 'Churn Risk'}
          </div>
          <StatusDot s={trainResult.accuracy >= 85 ? 'good' : 'warn'} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
          {isSales
            ? `Revenue prediction · ${trainResult.feature_count}-feature model`
            : `Customer retention · ${trainResult.customers_scored ?? trainResult.customers?.length ?? 0} scored`}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Accuracy', value: `${trainResult.accuracy}%`, color: trainResult.accuracy >= 85 ? '#00E5A0' : '#FFC85C' },
          { label: 'Algorithm', value: trainResult.algorithm.split(' ')[0] },
          { label: 'Features', value: `${trainResult.feature_count}` },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{ fontSize: 9.5, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color: color ?? 'var(--color-text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Health subscores */}
      <div style={{ padding: '12px 18px 16px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Business Health
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { label: 'Financial', value: scores.financial },
            { label: 'Customer', value: scores.customer },
            { label: 'Operations', value: scores.operations },
          ].map(({ label, value }) => {
            const color = value >= 75 ? '#00E5A0' : value >= 50 ? '#FFC85C' : '#FF6B6B'
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 70, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${value}%`, height: '100%',
                    background: color,
                    borderRadius: 2,
                    transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>{value}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 18px 16px' }}>
        <Link
          href="/dashboard/predictions"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0',
            background: 'rgba(79,70,255,0.1)',
            border: '1px solid rgba(79,70,255,0.22)',
            borderRadius: 8,
            fontSize: 12.5, fontWeight: 700,
            color: 'var(--color-accent-light)',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.1)')}
        >
          View Predictions <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ── SHAP features panel ───────────────────────────────────────────────────────
function ShapPanel({ features, compact = false }: { features: TrainResult['shap_global']; compact?: boolean }) {
  if (!features || features.length === 0) return null
  const count = compact ? 2 : 4
  const pad = compact ? '9px 14px' : '13px 16px'
  const gap = compact ? 5 : 7
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: pad,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <motion.div layout style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: compact ? 7 : 10 }}>
        Top Prediction Drivers
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {features.slice(0, count).map((f, i) => (
          <motion.div
            key={f.feature}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: compact ? 100 : 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {f.label}
            </span>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${f.importance}%`, background: f.raw >= 0 ? '#00E5A0' : '#FF6B6B', borderRadius: 2, transformOrigin: 'left', animation: `shap-grow 0.6s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 30, textAlign: 'right' }}>
              {f.importance}%
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── No-model empty state ──────────────────────────────────────────────────────
function NoModelState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, gap: 18, textAlign: 'center',
      animation: 'page-enter 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'rgba(79,70,255,0.15)',
        border: '1px solid rgba(79,70,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'icon-float 3s ease-in-out infinite',
        boxShadow: '0 0 28px rgba(79,70,255,0.18)',
      }}>
        <Database size={28} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          No AI model trained yet
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 340, lineHeight: 1.6 }}>
          Upload your business data and train your first model to see real insights, forecasts, and alerts.
        </div>
      </div>
      <Link
        href="/dashboard/data"
        style={{
          padding: '10px 24px',
          background: 'var(--color-accent)',
          borderRadius: 9,
          color: '#fff', textDecoration: 'none',
          fontSize: 13.5, fontWeight: 700,
          transition: 'transform 0.15s, box-shadow 0.15s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(79,70,255,0.4)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'none'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        Train your first model <ArrowRight size={14} />
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user } = useUser()
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [agentDailyTotal, setAgentDailyTotal] = useState<{ label: string; runs: number }[]>([])
  const [monitorExpanded, setMonitorExpanded] = useState(false)

  const firstName = user?.firstName ?? user?.fullName?.split(' ')[0] ?? null
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const raw = localStorage.getItem('train_result')
    const g = localStorage.getItem('goal')
    if (raw) { try { setTrainResult(JSON.parse(raw)) } catch {} }
    setGoal(g)
    setLoading(false)
    // Fetch agent analytics for the performance rhythm dropdown
    getAgentAnalytics()
      .then(d => setAgentDailyTotal(d.daily_total))
      .catch(() => {})
  }, [])

  const isSales = goal === 'sales_forecast'
  const isChurn = goal === 'churn_risk'

  // Build chart data
  const chartData = (() => {
    if (!trainResult) {
      // Placeholder data showing a rhythm pattern
      return [
        { label: 'Mon', value: 65 }, { label: 'Tue', value: 82 },
        { label: 'Wed', value: 95 }, { label: 'Thu', value: 78 },
        { label: 'Fri', value: 88 }, { label: 'Sat', value: 42 },
        { label: 'Sun', value: 30 },
      ]
    }
    if (isSales && trainResult.forecast_series) {
      return trainResult.forecast_series
        .filter(p => p.actual != null)
        .slice(-7)
        .map(p => ({ label: p.date.slice(5), value: p.actual as number }))
    }
    if (isChurn && trainResult.customers) {
      const riskBuckets = [
        { label: '0–20%', value: trainResult.customers.filter(c => c.risk <= 20).length },
        { label: '20–40%', value: trainResult.customers.filter(c => c.risk > 20 && c.risk <= 40).length },
        { label: '40–60%', value: trainResult.customers.filter(c => c.risk > 40 && c.risk <= 60).length },
        { label: '60–80%', value: trainResult.customers.filter(c => c.risk > 60 && c.risk <= 80).length },
        { label: '80%+', value: trainResult.customers.filter(c => c.risk > 80).length },
      ]
      return riskBuckets
    }
    return [
      { label: 'Mon', value: 65 }, { label: 'Tue', value: 82 },
      { label: 'Wed', value: 95 }, { label: 'Thu', value: 78 },
      { label: 'Fri', value: 88 }, { label: 'Sat', value: 42 },
      { label: 'Sun', value: 30 },
    ]
  })()

  const insightText = (() => {
    if (!trainResult) return 'Train a model to see AI-driven insights about your business performance'
    if (isSales) {
      const forecast = trainResult.forecast_series?.filter(p => p.predicted != null) ?? []
      const total = forecast.reduce((a, p) => a + (p.predicted ?? 0), 0)
      return `Revenue forecast: $${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} projected · Model accuracy: ${trainResult.accuracy}%`
    }
    if (isChurn) {
      const pct = ((trainResult.high_risk_count ?? 0) / Math.max(trainResult.customers_scored ?? 1, 1) * 100).toFixed(1)
      return `${pct}% of customers are at high risk · Focus retention on your top ${trainResult.high_risk_count ?? 0} accounts`
    }
    return `Your AI model achieved ${trainResult.accuracy}% accuracy on ${trainResult.training_rows.toLocaleString()} records`
  })()

  // KPI stat chips
  const statChips = loading ? [] : trainResult == null ? [] : isSales ? [
    {
      icon: DollarSign, label: 'Revenue (Last 14d)', accent: '#00E5A0',
      value: `$${(trainResult.forecast_series?.filter(p => p.actual != null).reduce((a, p) => a + (p.actual ?? 0), 0) ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: 'Sum of actual revenue in period',
      trend: `Forecast +$${(trainResult.forecast_series?.filter(p => p.predicted != null).reduce((a, p) => a + (p.predicted ?? 0), 0) ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} next 14d`,
      trendUp: true,
    },
    {
      icon: Zap, label: 'Model Accuracy', accent: '#4F46FF',
      value: `${trainResult.accuracy}%`,
      sub: `Algorithm: ${trainResult.algorithm}`,
      trend: `Trained on ${trainResult.training_rows.toLocaleString()} records`,
      trendUp: trainResult.accuracy >= 80,
    },
    {
      icon: TrendingUp, label: 'Mean Abs Error', accent: '#FFC85C',
      value: trainResult.mae != null ? `$${trainResult.mae.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—',
      sub: 'Per-day forecast error',
      trend: `R² score: ${trainResult.r2?.toFixed(3) ?? '—'}`,
      trendUp: (trainResult.mae ?? 999) < 500,
    },
    {
      icon: BarChart2, label: 'Features Used', accent: '#9B8BFF',
      value: `${trainResult.feature_count}`,
      sub: 'Input signals for forecasting',
      trend: trainResult.shap_global?.[0]?.label ? `Top: ${trainResult.shap_global[0].label}` : 'SHAP-ranked',
      trendUp: true,
    },
  ] : [
    {
      icon: Users, label: 'Customers Scored', accent: '#4F46FF',
      value: (trainResult.customers_scored ?? trainResult.customers?.length ?? 0).toLocaleString(),
      sub: 'Churn risk assessed for each',
      trend: `${trainResult.high_risk_count ?? 0} at high risk (>70%)`,
      trendUp: (trainResult.high_risk_count ?? 0) === 0,
    },
    {
      icon: AlertTriangle, label: 'High Risk Count', accent: '#FF6B6B',
      value: `${trainResult.high_risk_count ?? 0}`,
      sub: 'Churn probability > 70%',
      trend: `${(((trainResult.high_risk_count ?? 0) / Math.max(trainResult.customers_scored ?? 1, 1)) * 100).toFixed(1)}% of base`,
      trendUp: false,
    },
    {
      icon: Zap, label: 'Model Accuracy', accent: '#00E5A0',
      value: `${trainResult.accuracy}%`,
      sub: `Algorithm: ${trainResult.algorithm}`,
      trend: `Trained on ${trainResult.training_rows.toLocaleString()} records`,
      trendUp: trainResult.accuracy >= 80,
    },
    {
      icon: Activity, label: 'AUC Score', accent: '#FFC85C',
      value: trainResult.auc != null ? trainResult.auc.toFixed(3) : '—',
      sub: 'Area Under ROC Curve',
      trend: trainResult.auc != null ? (trainResult.auc >= 0.8 ? 'Excellent discrimination' : 'Fair') : '',
      trendUp: (trainResult.auc ?? 0) >= 0.75,
    },
  ]

  // Activity feed items from model
  const activityItems: FeedItem[] = []
  if (trainResult) {
    activityItems.push({
      agent: 'BI Agent', icon: '📊',
      action: `${isSales ? 'Sales Forecast' : 'Churn Risk'} model trained — ${trainResult.accuracy}% accuracy on ${trainResult.training_rows.toLocaleString()} records`,
      time: 'Just now', status: 'done', color: '#4F46FF', href: '/dashboard/predictions',
    })
    if (isChurn && (trainResult.high_risk_count ?? 0) > 0) {
      activityItems.push({
        agent: 'CX Agent', icon: '🎧',
        action: `${trainResult.high_risk_count} customer${trainResult.high_risk_count === 1 ? '' : 's'} at 70%+ churn risk — retention outreach recommended`,
        time: 'Just now', status: 'alert', color: '#00E5A0', href: '/dashboard/predictions',
      })
    }
    if (isSales) {
      const predictedTotal = trainResult.forecast_series?.filter(p => p.predicted != null).reduce((a, p) => a + (p.predicted ?? 0), 0) ?? 0
      if (predictedTotal > 0) {
        activityItems.push({
          agent: 'Finance Agent', icon: '💰',
          action: `Revenue forecast ready: $${predictedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} projected over next 14 days`,
          time: 'Just now', status: 'done', color: '#00D4FF', href: '/dashboard/predictions',
        })
      }
    }
    activityItems.push({
      agent: 'BI Agent', icon: '🔍',
      action: `SHAP explainability computed for all ${trainResult.feature_count} features — top driver: ${trainResult.shap_global?.[0]?.label ?? '—'}`,
      time: 'Just now', status: 'done', color: '#4F46FF', href: '/dashboard/explainability',
    })
  }

  return (
    <div>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24,
        animation: 'page-enter 0.38s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}>
              Overview
            </h1>
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00E5A0',
            boxShadow: '0 0 7px rgba(0,229,160,0.7)',
            animation: 'dot-pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
            Insights are updated automatically as you work
          </span>
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton h={14} w="55%" />
              <Skeleton h={28} w="75%" />
              <Skeleton h={11} w="90%" />
              <Skeleton h={11} w="60%" />
            </div>
          ))}
        </div>
      )}

      {/* ── No model ── */}
      {!loading && !trainResult && <NoModelState />}

      {/* ── Data views ── */}
      {!loading && trainResult && (
        <>
          {/* Stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {statChips.map((chip, i) => (
              <StatChip key={chip.label} {...chip} delay={0.06 + i * 0.06} />
            ))}
          </div>

          {/* Main content: chart + right panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>
            {/* Chart */}
            <PerformanceChart
              barData={chartData}
              insightText={insightText}
              shapData={trainResult.shap_global}
              metricsData={{
                accuracy: trainResult.accuracy,
                mae: trainResult.mae,
                rmse: trainResult.rmse,
                r2: trainResult.r2,
                auc: trainResult.auc,
              }}
              agentDailyTotal={agentDailyTotal}
            />

            {/* Model panel */}
            <ModelPanel trainResult={trainResult} goal={goal} />
          </div>

          {/* Bottom: SHAP + System Monitor (left) | Activity (right) */}
          <LayoutGroup>
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'stretch' }}>
              {/* Left column: flex column so SystemMonitor can flex:1 to fill remaining height */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
                {trainResult.shap_global && trainResult.shap_global.length > 0 && (
                  <ShapPanel features={trainResult.shap_global} compact={monitorExpanded} />
                )}
                <SystemMonitor
                  isExpanded={monitorExpanded}
                  onToggle={setMonitorExpanded}
                />
              </div>
              {/* Right column: Agent Activity */}
              <div style={{ gridColumn: trainResult.shap_global && trainResult.shap_global.length > 0 ? 'auto' : '1 / -1' }}>
                <AgentActivityFeed modelItems={activityItems} />
              </div>
            </motion.div>
          </LayoutGroup>

          {/* Churn: at-risk customers */}
          {isChurn && trainResult.customers && trainResult.customers.length > 0 && (
            <div style={{
              marginTop: 20,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '18px 20px',
              animation: 'page-enter 0.45s cubic-bezier(0.22,1,0.36,1) 0.4s both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Top At-Risk Customers</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Highest churn probability — take action now</div>
                </div>
                <Link href="/dashboard/predictions" style={{ fontSize: 11.5, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, transition: 'gap 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.gap = '5px')}
                  onMouseLeave={e => (e.currentTarget.style.gap = '3px')}
                >
                  All customers <ArrowRight size={11} />
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {trainResult.customers.slice(0, 4).map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 13px',
                      background: 'rgba(255,255,255,0.025)',
                      borderRadius: 9,
                      border: `1px solid ${c.risk >= 80 ? 'rgba(255,107,107,0.2)' : 'rgba(255,200,92,0.2)'}`,
                      transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1)',
                      animation: `page-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.44 + i * 0.05}s both`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `${c.risk >= 80 ? '#FF6B6B' : '#FFC85C'}20`,
                      border: `1px solid ${c.risk >= 80 ? '#FF6B6B' : '#FFC85C'}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: c.risk >= 80 ? '#FF6B6B' : '#FFC85C',
                      flexShrink: 0,
                    }}>
                      {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)', marginTop: 1 }}>
                        {c.days_inactive}d inactive{c.revenue > 0 ? ` · $${c.revenue.toLocaleString()}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color: c.risk >= 80 ? '#FF6B6B' : '#FFC85C', flexShrink: 0 }}>
                      {c.risk}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
