'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, TrendingDown, DollarSign, AlertTriangle, Search,
  ChevronDown, ChevronUp, ArrowRight, X, Database,
  ShieldAlert, Heart, Star, Clock, Zap,
} from 'lucide-react'
import type { ChurnCustomer, LocalSHAP } from '@/lib/api'

// ── Segment logic ────────────────────────────────────────────────────────────
type Segment = 'Champions' | 'Loyal' | 'At Risk' | 'High Risk' | 'Dormant' | 'Regular'

const SEGMENT_META: Record<Segment, { color: string; icon: typeof Star; desc: string }> = {
  Champions: { color: '#00E5A0', icon: Star,       desc: 'Low risk, high lifetime value' },
  Loyal:     { color: '#4F46FF', icon: Heart,       desc: 'Engaged customers, medium value' },
  Regular:   { color: '#9B8BFF', icon: Users,       desc: 'Average risk and spending' },
  Dormant:   { color: '#FFC85C', icon: Clock,       desc: 'Inactive 90+ days' },
  'At Risk': { color: '#FF8C42', icon: AlertTriangle, desc: 'Elevated churn probability' },
  'High Risk': { color: '#FF6B6B', icon: ShieldAlert,  desc: 'Critical — immediate action needed' },
}

function getSegment(c: ChurnCustomer): Segment {
  if (c.days_inactive >= 90)   return 'Dormant'
  if (c.risk >= 80)            return 'High Risk'
  if (c.risk >= 55)            return 'At Risk'
  if (c.risk < 30 && c.revenue >= 3000) return 'Champions'
  if (c.risk < 40 && c.revenue >= 1200) return 'Loyal'
  return 'Regular'
}

const riskColor = (r: number) => r >= 80 ? '#FF6B6B' : r >= 55 ? '#FF8C42' : r >= 35 ? '#FFC85C' : '#00E5A0'
const riskLabel = (r: number) => r >= 80 ? 'High' : r >= 55 ? 'At Risk' : r >= 35 ? 'Medium' : 'Low'

// ── Segment donut ────────────────────────────────────────────────────────────
function SegmentDonut({ counts, total }: { counts: Record<string, number>; total: number }) {
  const segments = Object.entries(counts).filter(([, v]) => v > 0)
  const colors = segments.map(([k]) => SEGMENT_META[k as Segment]?.color ?? '#4F46FF')
  const cx = 68, cy = 68, r = 54, innerR = 34, stroke = 16

  let cumAngle = -90
  const slices = segments.map(([key, count], i) => {
    const pct = count / total
    const angle = pct * 360
    const startRad = (cumAngle * Math.PI) / 180
    const endRad = ((cumAngle + angle) * Math.PI) / 180
    cumAngle += angle
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad),   y2 = cy + r * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0
    return { key, count, pct, color: colors[i], d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z` }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={136} height={136} viewBox="0 0 136 136" style={{ flexShrink: 0 }}>
        {slices.map(s => (
          <path key={s.key} d={s.d} fill={s.color} opacity={0.9} />
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill="var(--color-bg-elevated)" />
        <text x={cx} y={cy - 7} textAnchor="middle" fill="var(--color-text-primary)" fontSize={20} fontWeight={700}>{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--color-text-muted)" fontSize={9}>customers</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {slices.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1 }}>{s.key}</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', minWidth: 32, textAlign: 'right' }}>{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CLV bar chart ─────────────────────────────────────────────────────────────
function CLVDistribution({ customers }: { customers: ChurnCustomer[] }) {
  const buckets = [
    { label: '$0–500',    min: 0,    max: 500 },
    { label: '$500–1k',  min: 500,  max: 1000 },
    { label: '$1k–2k',   min: 1000, max: 2000 },
    { label: '$2k–4k',   min: 2000, max: 4000 },
    { label: '$4k+',     min: 4000, max: Infinity },
  ]
  const counts = buckets.map(b => customers.filter(c => c.revenue >= b.min && c.revenue < b.max).length)
  const maxCount = Math.max(...counts, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {buckets.map((b, i) => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 60, flexShrink: 0, textAlign: 'right' }}>{b.label}</span>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%', width: `${(counts[i] / maxCount) * 100}%`,
                background: `linear-gradient(90deg, #4F46FF, #00E5A0)`,
                borderRadius: 4,
                animation: `shap-grow 0.7s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.08}s both`,
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-secondary)', width: 20, textAlign: 'right' }}>{counts[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Risk distribution bar ─────────────────────────────────────────────────────
function RiskMeter({ customers }: { customers: ChurnCustomer[] }) {
  const low    = customers.filter(c => c.risk < 35).length
  const med    = customers.filter(c => c.risk >= 35 && c.risk < 55).length
  const atRisk = customers.filter(c => c.risk >= 55 && c.risk < 80).length
  const high   = customers.filter(c => c.risk >= 80).length
  const total  = customers.length || 1

  const bars = [
    { label: 'Low', count: low,    color: '#00E5A0', pct: low / total },
    { label: 'Med', count: med,    color: '#FFC85C', pct: med / total },
    { label: 'At Risk', count: atRisk, color: '#FF8C42', pct: atRisk / total },
    { label: 'High', count: high,  color: '#FF6B6B', pct: high / total },
  ]

  return (
    <div>
      <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10, gap: 2 }}>
        {bars.map((b, i) => b.count > 0 && (
          <div key={b.label} style={{ flex: b.pct, background: b.color, borderRadius: i === 0 ? '5px 0 0 5px' : i === bars.length - 1 ? '0 5px 5px 0' : 0, transition: 'flex 0.8s cubic-bezier(0.22,1,0.36,1)', minWidth: b.count > 0 ? 4 : 0 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: b.color }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.label}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: b.color }}>{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Customer detail panel ─────────────────────────────────────────────────────
function CustomerPanel({ customer, onClose }: { customer: ChurnCustomer; onClose: () => void }) {
  const segment = getSegment(customer)
  const meta = SEGMENT_META[segment]
  const topShap = [...(customer.local_shap ?? [])].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)).slice(0, 5)
  const maxShap = Math.max(...topShap.map(s => Math.abs(s.shap_value)), 0.001)

  const retentionActions: string[] = []
  if (customer.days_inactive > 30) retentionActions.push(`Send re-engagement email — last active ${customer.days_inactive}d ago`)
  if (customer.risk >= 70) retentionActions.push('Offer a loyalty discount or exclusive deal')
  if (customer.risk >= 80) retentionActions.push('Flag for personal outreach from account manager')
  if (customer.revenue >= 2000) retentionActions.push('Invite to VIP loyalty program')
  if (retentionActions.length === 0) retentionActions.push('Continue regular engagement cadence')

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--color-bg-elevated)', borderLeft: '1px solid var(--color-border)', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 48px rgba(0,0,0,0.4)', animation: 'slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`@keyframes slideInRight { from { transform:translateX(100%);opacity:0 } to { transform:translateX(0);opacity:1 } }`}</style>

      {/* Header */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${riskColor(customer.risk)}20`, border: `2px solid ${riskColor(customer.risk)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: riskColor(customer.risk), flexShrink: 0 }}>
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>{customer.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}35`, borderRadius: 5, padding: '2px 8px' }}>{segment}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ID: {customer.id}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6, display: 'flex', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Churn Risk', value: `${customer.risk}%`, color: riskColor(customer.risk) },
            { label: 'Lifetime Value', value: `$${customer.revenue.toLocaleString()}`, color: '#00E5A0' },
            { label: 'Days Inactive', value: `${customer.days_inactive}d`, color: customer.days_inactive > 60 ? '#FFC85C' : 'var(--color-text-secondary)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--color-bg-base)', borderRadius: 9, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Churn risk bar */}
        <div style={{ background: 'var(--color-bg-base)', borderRadius: 10, padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>Churn Probability</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: riskColor(customer.risk) }}>{riskLabel(customer.risk)} · {customer.risk}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${customer.risk}%`, background: `linear-gradient(90deg, #00E5A0, ${riskColor(customer.risk)})`, borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
        </div>

        {/* SHAP waterfall */}
        {topShap.length > 0 && (
          <div style={{ background: 'var(--color-bg-base)', borderRadius: 10, padding: '14px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Why this risk score? (SHAP)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topShap.map(s => {
                const pct = (Math.abs(s.shap_value) / maxShap) * 100
                const positive = s.shap_value > 0
                return (
                  <div key={s.feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label || s.feature}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: positive ? '#FF6B6B' : '#00E5A0', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: positive ? '#FF6B6B' : '#00E5A0', minWidth: 44, textAlign: 'right' }}>
                      {positive ? '+' : ''}{s.shap_value.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--color-text-muted)' }}>
              <span style={{ color: '#FF6B6B', fontWeight: 700 }}>Red</span> = increases churn risk &nbsp;·&nbsp; <span style={{ color: '#00E5A0', fontWeight: 700 }}>Green</span> = reduces churn risk
            </div>
          </div>
        )}

        {/* Retention actions */}
        <div style={{ background: 'var(--color-bg-base)', borderRadius: 10, padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Zap size={13} style={{ color: '#FFC85C' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>Suggested Retention Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {retentionActions.map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(79,70,255,0.15)', border: '1px solid rgba(79,70,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-accent-light)' }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasModel }: { hasModel: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 16, textAlign: 'center', animation: 'dash-enter 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'icon-float 3s ease-in-out infinite', boxShadow: '0 0 24px rgba(79,70,255,0.2)' }}>
        <Users size={28} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          {hasModel ? 'No customer data in this model' : 'Train a churn risk model to see customers'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 380, lineHeight: 1.65 }}>
          {hasModel
            ? 'The Customer Intelligence Dashboard requires a Churn Risk model. Your current model is a Sales Forecast — train a new model with churn data to unlock this view.'
            : 'Upload customer data with purchase history and inactivity signals, then train a Churn Risk model to get 360° customer profiles, segment analysis, and AI-powered retention actions.'}
        </div>
      </div>
      <Link
        href="/dashboard/data"
        style={{ marginTop: 8, padding: '10px 24px', background: 'var(--color-accent)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, transition: 'transform 0.15s, box-shadow 0.15s', display: 'inline-block' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,255,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {hasModel ? 'Train churn model' : 'Upload customer data'} →
      </Link>
    </div>
  )
}

// ── Sort icon helper ──────────────────────────────────────────────────────────
function SortIcon({ field, current, dir }: { field: string; current: string; dir: 'asc' | 'desc' }) {
  if (field !== current) return <ChevronDown size={12} style={{ opacity: 0.3 }} />
  return dir === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--color-accent-light)' }} /> : <ChevronDown size={12} style={{ color: 'var(--color-accent-light)' }} />
}

// ── KPI card ──────────────────────────────────────────────────────────────────
type KpiCardProps = {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  color: string
  trendUp: boolean
  trend: string
  animDelay: number
}
function KpiCard({ icon: Icon, label, value, sub, color, trendUp, trend, animDelay }: KpiCardProps) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: 'var(--color-bg-elevated)', border: `1px solid ${hov ? `${color}40` : 'var(--color-border)'}`, borderRadius: 12, padding: '18px 20px', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? `0 10px 28px ${color}18` : 'none', transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)', animation: `dash-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${animDelay}s both` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 7 }}>{sub}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: trendUp ? '#00E5A0' : '#FF6B6B', fontWeight: 600 }}>
        {trendUp ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {trend}
      </div>
    </div>
  )
}

// ── Customer row ──────────────────────────────────────────────────────────────
function CustomerRow({ c, index, onClick }: { c: ChurnCustomer; index: number; onClick: () => void }) {
  const [rowHov, setRowHov] = useState(false)
  const seg = getSegment(c)
  const segMeta = SEGMENT_META[seg]
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setRowHov(true)}
      onMouseLeave={() => setRowHov(false)}
      style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 110px 100px 80px', padding: '12px 20px', gap: 12, borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: rowHov ? 'rgba(79,70,255,0.04)' : 'transparent', transition: 'background 0.15s', animation: `dash-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.35 + index * 0.025}s both` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${riskColor(c.risk)}18`, border: `1px solid ${riskColor(c.risk)}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: riskColor(c.risk), flexShrink: 0 }}>
          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ID: {c.id}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: segMeta.color, background: `${segMeta.color}15`, border: `1px solid ${segMeta.color}30`, borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }}>{seg}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${c.risk}%`, background: riskColor(c.risk), borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: riskColor(c.risk), minWidth: 36 }}>{c.risk}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        ${c.revenue.toLocaleString()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: c.days_inactive > 60 ? '#FFC85C' : 'var(--color-text-secondary)', fontWeight: c.days_inactive > 60 ? 700 : 400 }}>
        {c.days_inactive}d
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <ArrowRight size={13} style={{ color: rowHov ? 'var(--color-accent-light)' : 'var(--color-text-muted)', transition: 'color 0.15s' }} />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
type SortField = 'name' | 'risk' | 'revenue' | 'days_inactive'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ChurnCustomer[]>([])
  const [hasModel, setHasModel] = useState(false)
  const [isChurn, setIsChurn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string>('All')
  const [sortField, setSortField] = useState<SortField>('risk')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<ChurnCustomer | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('train_result')
    const goal = localStorage.getItem('goal')
    setHasModel(!!raw)
    setIsChurn(goal === 'churn_risk')
    if (raw && goal === 'churn_risk') {
      try {
        const tr = JSON.parse(raw)
        setCustomers(tr.customers ?? [])
      } catch {}
    }
    setLoading(false)
  }, [])

  // Derived segment counts
  const segmentCounts = useMemo(() => {
    const counts: Partial<Record<Segment, number>> = {}
    customers.forEach(c => {
      const s = getSegment(c)
      counts[s] = (counts[s] ?? 0) + 1
    })
    return counts as Record<string, number>
  }, [customers])

  // Stats
  const totalRevenue  = useMemo(() => customers.reduce((acc, c) => acc + c.revenue, 0), [customers])
  const avgRisk       = useMemo(() => customers.length ? Math.round(customers.reduce((acc, c) => acc + c.risk, 0) / customers.length) : 0, [customers])
  const highRiskCount = useMemo(() => customers.filter(c => c.risk >= 70).length, [customers])
  const atRiskRevenue = useMemo(() => customers.filter(c => c.risk >= 55).reduce((acc, c) => acc + c.revenue, 0), [customers])
  const avgCLV        = useMemo(() => customers.length ? Math.round(totalRevenue / customers.length) : 0, [customers, totalRevenue])

  // Filtered + sorted list
  const displayed = useMemo(() => {
    let list = customers.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
      const matchSegment = segmentFilter === 'All' || getSegment(c) === segmentFilter
      return matchSearch && matchSegment
    })
    list = [...list].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name') return mul * a.name.localeCompare(b.name)
      return mul * ((a[sortField] as number) - (b[sortField] as number))
    })
    return list
  }, [customers, search, segmentFilter, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const showData = !loading && isChurn && customers.length > 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, animation: 'dash-enter 0.4s cubic-bezier(0.22,1,0.36,1) 0s both' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 6 }}>
          Customer Intelligence
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          {showData
            ? `${customers.length} customers · 360° profiles, segment analysis, and retention signals`
            : 'AI-powered customer profiles, CLV tracking, and churn prevention'}
        </p>
      </div>

      {/* Empty states */}
      {!loading && (!hasModel || !isChurn || customers.length === 0) && (
        <EmptyState hasModel={hasModel} />
      )}

      {/* Full dashboard */}
      {showData && (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, animation: 'dash-enter 0.45s cubic-bezier(0.22,1,0.36,1) 0.06s both' }}>
            <KpiCard icon={Users}         label="Total Customers"    value={customers.length.toString()}                          sub="Scored for churn risk"           color="#4F46FF"  trendUp={true}  trend={`${segmentCounts['Champions'] ?? 0} Champions`}                              animDelay={0.08} />
            <KpiCard icon={AlertTriangle} label="High Risk"           value={highRiskCount.toString()}                              sub="Churn probability ≥ 70%"         color="#FF6B6B"  trendUp={false} trend={`${((highRiskCount / customers.length) * 100).toFixed(1)}% of base`}         animDelay={0.15} />
            <KpiCard icon={DollarSign}    label="Avg Lifetime Value"  value={`$${avgCLV.toLocaleString()}`}                        sub="Per customer average"            color="#00E5A0"  trendUp={true}  trend={`$${totalRevenue.toLocaleString()} total`}                                   animDelay={0.22} />
            <KpiCard icon={TrendingDown}  label="Revenue at Risk"     value={`$${(atRiskRevenue / 1000).toFixed(1)}k`}             sub="From customers risk ≥ 55%"       color="#FFC85C"  trendUp={false} trend={`${customers.filter(c => c.risk >= 55).length} customers`}                  animDelay={0.29} />
          </div>

          {/* Middle row: segment donut + risk meter + CLV */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24, animation: 'dash-enter 0.45s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>

            {/* Segment breakdown */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Customer Segments</div>
              <SegmentDonut counts={segmentCounts} total={customers.length} />
            </div>

            {/* Risk distribution */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Churn Risk Distribution</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>Average risk: <span style={{ color: riskColor(avgRisk), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{avgRisk}%</span></div>
              <RiskMeter customers={customers} />

              {/* Avg inactive */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Avg days inactive</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {Math.round(customers.reduce((acc, c) => acc + c.days_inactive, 0) / customers.length)}d
                </div>
              </div>
            </div>

            {/* CLV distribution */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Lifetime Value Distribution</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>Total CLV: <span style={{ color: '#00E5A0', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>${totalRevenue.toLocaleString()}</span></div>
              <CLVDistribution customers={customers} />
            </div>
          </div>

          {/* Customer table */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', animation: 'dash-enter 0.45s cubic-bezier(0.22,1,0.36,1) 0.32s both' }}>
            {/* Table header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginRight: 4 }}>
                Customer Profiles
              </div>

              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or ID…"
                  style={{ width: '100%', padding: '7px 10px 7px 30px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* Segment filter pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['All', ...Object.keys(segmentCounts)].map(seg => (
                  <button
                    key={seg}
                    onClick={() => setSegmentFilter(seg)}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', borderColor: segmentFilter === seg ? (SEGMENT_META[seg as Segment]?.color ?? 'rgba(79,70,255,0.5)') : 'var(--color-border)', background: segmentFilter === seg ? `${SEGMENT_META[seg as Segment]?.color ?? '#4F46FF'}15` : 'transparent', color: segmentFilter === seg ? (SEGMENT_META[seg as Segment]?.color ?? 'var(--color-accent-light)') : 'var(--color-text-muted)' }}
                  >
                    {seg} {seg !== 'All' && segmentCounts[seg] ? `(${segmentCounts[seg]})` : ''}
                  </button>
                ))}
              </div>

              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-muted)' }}>{displayed.length} shown</div>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 110px 100px 80px', padding: '10px 20px', borderBottom: '1px solid var(--color-border)', gap: 12 }}>
              {([
                { label: 'Customer', field: 'name' as SortField },
                { label: 'Segment', field: null },
                { label: 'Churn Risk', field: 'risk' as SortField },
                { label: 'Lifetime Value', field: 'revenue' as SortField },
                { label: 'Inactive', field: 'days_inactive' as SortField },
                { label: '', field: null },
              ] as { label: string; field: SortField | null }[]).map(col => (
                <div
                  key={col.label}
                  onClick={() => col.field && handleSort(col.field)}
                  style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, cursor: col.field ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  {col.label}
                  {col.field && <SortIcon field={col.field} current={sortField} dir={sortDir} />}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {displayed.map((c, i) => (
                <CustomerRow key={c.id} c={c} index={i} onClick={() => setSelected(c)} />
              ))}

              {displayed.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  No customers match your filters.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Customer detail panel */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }} />
          <CustomerPanel customer={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
