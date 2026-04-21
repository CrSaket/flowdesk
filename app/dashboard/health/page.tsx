'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { Activity, RefreshCw, Database, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getModelHealth, type ModelHealth } from '@/lib/api'

const driftColor = { none: '#00E5A0', mild: '#FFC85C', moderate: '#FF6B6B' }
const driftLabel = { none: 'Stable', mild: 'Mild', moderate: 'Moderate' }

function Skeleton({ w = '100%', h = 20, radius = 6 }: { w?: string | number, h?: number, radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

function NoModelState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Database size={28} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>No model trained yet</div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          Train a model in the Data Hub to monitor its health, accuracy, and data drift.
        </div>
      </div>
      <Link href="/dashboard/data" style={{ marginTop: 8, padding: '10px 24px', background: 'var(--color-accent)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
        Go to Data Hub →
      </Link>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function HealthPage() {
  const [health, setHealth] = useState<ModelHealth | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('model_id')
    const g = localStorage.getItem('goal')
    setModelId(id)
    setGoal(g)
    if (!id) { setLoading(false); return }

    getModelHealth(id)
      .then(data => { setHealth(data); setLoading(false) })
      .catch(e => { setError(e.message ?? 'Failed to load health data.'); setLoading(false) })
  }, [])

  const isSales = goal === 'sales_forecast'
  const status = health ? (health.accuracy >= 85 ? 'good' : 'warn') : 'good'
  const statusColor = { good: '#00E5A0', warn: '#FFC85C', bad: '#FF6B6B' }

  // Build simulated accuracy history from real accuracy (6 weeks trending up to current)
  const accuracyHistory = health ? (() => {
    const base = Math.max(70, health.accuracy - 8)
    return ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'].map((week, i) => ({
      date: week,
      acc: parseFloat((base + ((health.accuracy - base) * (i / 5))).toFixed(1)),
    }))
  })() : []

  const hasDrift = health?.drift_features?.some(d => d.status !== 'none') ?? false
  const moderateDrift = health?.drift_features?.filter(d => d.status === 'moderate') ?? []

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Model Health Monitor</h1>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[0,1].map(i => <div key={i} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', height: 180, display: 'flex', flexDirection: 'column', gap: 12 }}><Skeleton h={16} w="70%" /><Skeleton h={100} /></div>)}
          </div>
          <Skeleton h={200} />
        </div>
      )}

      {!loading && !modelId && <NoModelState />}

      {!loading && error && (
        <div style={{ padding: '16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, fontSize: 13, color: '#FF6B6B' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{error} — make sure the backend is running.</span>
        </div>
      )}

      {!loading && health && !error && (
        <>
          {/* Model Overview Card */}
          <div style={{ background: 'var(--color-bg-elevated)', border: `1px solid ${status === 'warn' ? 'rgba(255,200,92,0.3)' : 'var(--color-border)'}`, borderRadius: 12, padding: '20px 24px', marginBottom: 24, position: 'relative' }}>
            {hasDrift && (
              <div style={{ position: 'absolute', top: -10, right: 20, background: '#FFC85C', color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>Data drift detected</div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                  {isSales ? 'Sales Forecast' : 'Churn Risk'} Model
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{health.algorithm}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: statusColor[status as keyof typeof statusColor] }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[status as keyof typeof statusColor], boxShadow: `0 0 6px ${statusColor[status as keyof typeof statusColor]}` }} />
                {status === 'good' ? 'Healthy' : 'Warning'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {[
                { label: 'Accuracy', value: `${health.accuracy}%`, color: health.accuracy >= 85 ? '#00E5A0' : '#FFC85C' },
                { label: isSales ? 'R² Score' : 'AUC Score', value: isSales ? (health.r2?.toFixed(3) ?? '—') : (health.auc?.toFixed(3) ?? '—'), color: 'var(--color-text-primary)' },
                { label: isSales ? 'MAE' : 'Model Type', value: isSales ? (health.mae != null ? `$${health.mae.toFixed(0)}` : '—') : 'Classifier', color: 'var(--color-text-primary)' },
                { label: 'Features', value: `${health.feature_count}`, color: 'var(--color-text-primary)' },
                { label: 'Training Rows', value: health.training_rows.toLocaleString(), color: 'var(--color-text-primary)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--color-bg-base)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Accuracy Over Time (simulated trend) */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Accuracy Trend</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Simulated 6-week convergence to current accuracy · floor = 85%</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={accuracyHistory} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7c8aa0' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[65, 100]} tick={{ fontSize: 10, fill: '#7c8aa0' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                  <ReferenceLine y={85} stroke="rgba(255,107,107,0.4)" strokeDasharray="4 4" label={{ value: 'Floor 85%', fill: '#7c8aa0', fontSize: 9 }} />
                  <Line type="monotone" dataKey="acc" stroke="#4F46FF" strokeWidth={2.5} dot={{ r: 3 }} name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Drift (PSI) */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Data Drift — Population Stability Index</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>PSI &gt; 0.1 = mild · PSI &gt; 0.2 = significant · computed on your data</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {health.drift_features.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '12px 0' }}>No features available for drift analysis.</div>
                )}
                {health.drift_features.map(d => (
                  <div key={d.feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: 170, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (d.psi / 0.25) * 100)}%`, background: driftColor[d.status as keyof typeof driftColor], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: driftColor[d.status as keyof typeof driftColor], minWidth: 36 }}>
                      {d.psi.toFixed(3)}
                    </span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${driftColor[d.status as keyof typeof driftColor]}15`, color: driftColor[d.status as keyof typeof driftColor], fontWeight: 600, minWidth: 60, textAlign: 'center' }}>
                      {driftLabel[d.status as keyof typeof driftLabel]}
                    </span>
                  </div>
                ))}
              </div>
              {moderateDrift.length > 0 && (
                <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,200,92,0.06)', borderRadius: 6, border: '1px solid rgba(255,200,92,0.15)', fontSize: 11, color: '#FFC85C' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{moderateDrift.map(d => d.label).join(', ')} {moderateDrift.length === 1 ? 'shows' : 'show'} significant drift. Consider retraining with recent data.</span>
                </div>
              )}
              {!hasDrift && health.drift_features.length > 0 && (
                <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(0,229,160,0.06)', borderRadius: 6, border: '1px solid rgba(0,229,160,0.15)', fontSize: 11, color: '#00E5A0' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>All features are stable. No significant distribution shift detected.</span>
                </div>
              )}
            </div>
          </div>

          {/* Retrain recommendation */}
          {(hasDrift || health.accuracy < 85) && (
            <div style={{ background: 'rgba(255,200,92,0.06)', border: '1px solid rgba(255,200,92,0.3)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertTriangle size={16} style={{ color: '#FFC85C', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFC85C', marginBottom: 4 }}>Retrain Recommended</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {hasDrift ? `Data drift detected in ${moderateDrift.length > 0 ? moderateDrift.map(d => d.label).join(', ') : 'one or more features'}.` : ''}{' '}
                    {health.accuracy < 85 ? `Current accuracy (${health.accuracy}%) is below the recommended 85% floor.` : ''}
                    {' '}Upload fresh data and retrain to restore performance.
                  </div>
                </div>
              </div>
              <Link href="/dashboard/data" style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 8, background: 'rgba(255,200,92,0.15)', border: '1px solid rgba(255,200,92,0.3)', color: '#FFC85C', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={13} /> Retrain Model
              </Link>
            </div>
          )}

          {/* All healthy */}
          {!hasDrift && health.accuracy >= 85 && (
            <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 12, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={16} style={{ color: '#00E5A0', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#00E5A0' }}>Model is healthy.</strong> Accuracy is {health.accuracy}% with no significant data drift across {health.drift_features.length} feature{health.drift_features.length !== 1 ? 's' : ''}. No action needed.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
