'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { AlertTriangle, CheckCircle, Database, Shield } from 'lucide-react'
import Link from 'next/link'
import { getModelFairness, type ModelFairness, type FairnessAttribute } from '@/lib/api'

// ── Gauge ─────────────────────────────────────────────────────────────────
function FairnessGauge({ score, size = 90 }: { score: number; size?: number }) {
  const r = (size / 2) - 8
  const cx = size / 2, cy = size / 2
  const color = score > 80 ? '#00E5A0' : score > 60 ? '#FFC85C' : '#FF6B6B'
  const endAngle = Math.PI + (score / 100) * Math.PI
  const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
  return (
    <svg width={size} height={size * 0.6}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${score > 50 ? 1 : 0} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize={size * 0.2} fontWeight={700}>{score}</text>
    </svg>
  )
}

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
          Train a churn risk model in the Data Hub to enable fairness monitoring.
        </div>
      </div>
      <Link href="/dashboard/data" style={{ marginTop: 8, padding: '10px 24px', background: 'var(--color-accent)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
        Go to Data Hub →
      </Link>
    </div>
  )
}

function AttributeCard({ a }: { a: FairnessAttribute }) {
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: `1px solid ${a.status === 'warn' ? 'rgba(255,200,92,0.3)' : 'var(--color-border)'}`, borderRadius: 12, padding: '18px 20px', position: 'relative' }}>
      {a.status === 'warn' && (
        <div style={{ position: 'absolute', top: -10, right: 14, background: '#FFC85C', color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Needs Review</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{a.attr}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <FairnessGauge score={a.score} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Disparate Impact Score</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {a.groups.map(g => (
              <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--color-text-muted)', width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.rate * 100}%`, background: a.score > 80 ? '#00E5A0' : '#FFC85C', borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{(g.rate * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function FairnessPage() {
  const [modelId, setModelId] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [fairness, setFairness] = useState<ModelFairness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('model_id')
    const g = localStorage.getItem('goal')
    setModelId(id)
    setGoal(g)
    if (!id) { setLoading(false); return }

    getModelFairness(id)
      .then(data => { setFairness(data); setLoading(false) })
      .catch(e => { setError(e.message ?? 'Failed to load fairness data.'); setLoading(false) })
  }, [])

  const warnAttrs = fairness?.attributes?.filter(a => a.status === 'warn') ?? []

  // Build line chart series keys from history
  const historyKeys = fairness?.attributes?.map((_, i) => `score_${i}`) ?? []
  const attrColors = ['#00E5A0', '#FFC85C', '#4F46FF', '#FF6B6B']

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Fairness & Bias Monitor</h1>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[0,1,2].map(i => <div key={i} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', height: 160, display: 'flex', flexDirection: 'column', gap: 12 }}><Skeleton h={16} w="70%" /><Skeleton h={90} /></div>)}
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

      {!loading && fairness && !error && (
        <>
          {/* Not applicable (sales model) */}
          {!fairness.applicable && (
            <div style={{ padding: '20px 24px', background: 'rgba(79,70,255,0.06)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Shield size={16} style={{ color: 'var(--color-accent-light)' }} />
                <strong style={{ color: 'var(--color-text-primary)' }}>Fairness monitoring is designed for classification models</strong>
              </div>
              {fairness.message}
              <div style={{ marginTop: 12 }}>
                To use fairness monitoring, train a <Link href="/dashboard/data" style={{ color: 'var(--color-accent-light)' }}>Churn Risk model</Link>.
              </div>
            </div>
          )}

          {fairness.applicable && (
            <>
              {/* Overall score banner */}
              <div style={{ marginBottom: 20, padding: '14px 20px', background: fairness.overall_score >= 80 ? 'rgba(0,229,160,0.06)' : 'rgba(255,200,92,0.06)', border: `1px solid ${fairness.overall_score >= 80 ? 'rgba(0,229,160,0.2)' : 'rgba(255,200,92,0.2)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                {fairness.overall_score >= 80
                  ? <CheckCircle size={18} style={{ color: '#00E5A0', flexShrink: 0 }} />
                  : <AlertTriangle size={18} style={{ color: '#FFC85C', flexShrink: 0 }} />
                }
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Overall Fairness Score: {fairness.overall_score}
                    {fairness.overall_score >= 80 ? ' — Acceptable' : ' — Needs attention'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {warnAttrs.length === 0
                      ? 'All monitored segments are within the 80% disparate impact threshold.'
                      : `${warnAttrs.length} segment${warnAttrs.length > 1 ? 's' : ''} below the 80% threshold: ${warnAttrs.map(a => a.attr).join(', ')}.`}
                  </div>
                </div>
              </div>

              {/* Attribute cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(fairness.attributes.length, 3)}, 1fr)`, gap: 16, marginBottom: 24 }}>
                {fairness.attributes.map(a => <AttributeCard key={a.attr} a={a} />)}
              </div>

              {/* Bias alerts for warn attributes */}
              {warnAttrs.map(a => (
                <div key={a.attr} style={{ background: 'rgba(255,200,92,0.06)', border: '1px solid rgba(255,200,92,0.3)', borderRadius: 12, padding: '18px 22px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <AlertTriangle size={16} style={{ color: '#FFC85C', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFC85C', marginBottom: 4 }}>Bias Alert — {a.attr}</div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{a.note}</p>
                    </div>
                  </div>
                  {a.recommendation && (
                    <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recommendation</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{a.recommendation}</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Fairness History Chart */}
              {fairness.history && fairness.history.length > 0 && (
                <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Fairness Score History</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Simulated trend based on current model scores across 6 retraining cycles</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={fairness.history} margin={{ top: 5, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#7c8aa0' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#7c8aa0' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                      <ReferenceLine y={80} stroke="rgba(255,200,92,0.4)" strokeDasharray="4 4" label={{ value: 'Threshold (80)', fill: '#7c8aa0', fontSize: 10 }} />
                      {fairness.attributes.map((a, i) => (
                        <Line key={a.attr} type="monotone" dataKey={`score_${i}`} stroke={attrColors[i % attrColors.length]} strokeWidth={2} dot={{ r: 3 }} name={a.attr} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                    {fairness.attributes.map((a, i) => (
                      <span key={a.attr} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-muted)' }}>
                        <span style={{ width: 14, height: 2, background: attrColors[i % attrColors.length], display: 'inline-block', borderRadius: 1 }} /> {a.attr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
