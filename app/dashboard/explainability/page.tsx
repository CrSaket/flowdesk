'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { Database } from 'lucide-react'
import Link from 'next/link'
import {
  getSHAPLocal, getLIMELocal, getCounterfactual, getExplainSummary,
  type SHAPFeature, type LocalSHAP, type CounterfactualSuggestion, type TrainResult,
} from '@/lib/api'
import { Sparkles, RefreshCw } from 'lucide-react'

// ── SHAP Beeswarm ─────────────────────────────────────────────────────────
function ShapBeeswarm({ features }: { features: SHAPFeature[] }) {
  if (!features.length) return null
  const W = 600, barHeight = 24
  const H = features.length * barHeight + 30
  const leftPad = 180, rightPad = 24
  const maxImp = features[0].importance // sorted desc

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={leftPad} y1={H - 18} x2={W - rightPad} y2={H - 18} stroke="rgba(255,255,255,0.1)" />
      <text x={(leftPad + W - rightPad) / 2} y={H - 4} textAnchor="middle" fill="#7c8aa0" fontSize={9}>← Low Impact — High Impact →</text>
      {features.map((item, i) => {
        const y = 8 + i * barHeight
        const dotX = leftPad + (item.importance / (maxImp || 1)) * (W - leftPad - rightPad - 20)
        const color = item.raw >= 0 ? '#00E5A0' : '#FF6B6B'
        return (
          <g key={item.feature}>
            <text x={leftPad - 8} y={y + 8} textAnchor="end" fill="#9aa0b0" fontSize={10} dominantBaseline="middle">
              {item.label.length > 22 ? item.label.slice(0, 22) + '…' : item.label}
            </text>
            <rect x={leftPad} y={y + 4} width={W - leftPad - rightPad - 20} height={4} rx={2} fill="rgba(255,255,255,0.04)" />
            <rect x={leftPad} y={y + 4} width={dotX - leftPad} height={4} rx={2} fill={color} fillOpacity={0.3} />
            {[...Array(Math.min(6, Math.ceil(item.importance / 10) + 2))].map((_, di) => (
              <circle key={di} cx={leftPad + (item.importance / (maxImp || 1)) * (W - leftPad - rightPad - 20) * (0.4 + di * 0.15)} cy={y + 6 + (di % 2 === 0 ? -3 : 3)} r={3.5} fill={color} fillOpacity={0.6 + di * 0.05} />
            ))}
            <text x={dotX + 8} y={y + 8} fill={color} fontSize={10} fontWeight={700} dominantBaseline="middle">{item.importance}%</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── SHAP Local Waterfall ──────────────────────────────────────────────────
function LocalWaterfall({ baseValue, prediction, waterfall, isClassifier }: {
  baseValue: number
  prediction: number
  waterfall: LocalSHAP[]
  isClassifier: boolean
}) {
  const top5 = waterfall.slice(0, 5)
  let running = baseValue
  const W = 500, H = 180, leftPad = 175, rightPad = 20, topPad = 12, botPad = 20
  const bars = top5.map(item => {
    const s = running
    running += item.shap_value
    return { ...item, start: s, end: running }
  })
  const allVals = [baseValue, prediction, ...bars.map(b => b.start), ...bars.map(b => b.end)]
  const maxV = Math.max(...allVals) + (isClassifier ? 0.08 : Math.abs(Math.max(...allVals)) * 0.1)
  const minV = Math.min(...allVals) - (isClassifier ? 0.05 : Math.abs(Math.min(...allVals)) * 0.05)
  const range = maxV - minV || 1
  const toY = (v: number) => topPad + ((maxV - v) / range) * (H - topPad - botPad)
  const bw = (W - leftPad - rightPad) / bars.length - 6

  const fmt = (v: number) => isClassifier ? `${(v * 100).toFixed(0)}%` : `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  const fmtDelta = (v: number) => isClassifier ? `${(v * 100).toFixed(0)}%` : `$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  const finalColor = isClassifier ? (prediction > 0.7 ? '#FF6B6B' : prediction > 0.4 ? '#FFC85C' : '#00E5A0') : '#4F46FF'

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={leftPad} y1={toY(baseValue)} x2={W - rightPad} y2={toY(baseValue)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
      <text x={leftPad - 8} y={toY(baseValue)} textAnchor="end" fill="#7c8aa0" fontSize={9} dominantBaseline="middle">
        Baseline {fmt(baseValue)}
      </text>
      {bars.map((b, i) => {
        const x = leftPad + i * ((W - leftPad - rightPad) / bars.length) + 3
        const y1 = toY(Math.max(b.start, b.end))
        const y2 = toY(Math.min(b.start, b.end))
        const color = b.shap_value > 0 ? '#FF6B6B' : '#4F9EFF'
        return (
          <g key={b.feature}>
            <text x={leftPad - 8} y={(y1 + y2) / 2} textAnchor="end" fill="#9aa0b0" fontSize={9} dominantBaseline="middle">
              {b.label.length > 22 ? b.label.slice(0, 22) + '…' : b.label}
            </text>
            <rect x={x} y={y1} width={bw} height={Math.max(y2 - y1, 3)} fill={color} fillOpacity={0.85} rx={2} />
            <text x={x + bw / 2} y={b.shap_value > 0 ? y2 + 11 : y1 - 4} textAnchor="middle" fill={color} fontSize={9} fontWeight={700}>
              {b.shap_value > 0 ? '+' : '-'}{fmtDelta(b.shap_value)}
            </text>
          </g>
        )
      })}
      <text x={W - rightPad - 5} y={toY(prediction) - 6} textAnchor="end" fill={finalColor} fontSize={10} fontWeight={700}>
        Final: {fmt(prediction)}
      </text>
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 20, radius = 6 }: { w?: string | number, h?: number, radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

// ── No-model state ────────────────────────────────────────────────────────
function NoModelState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Database size={28} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>No model trained yet</div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          Train a model in the Data Hub to see real SHAP, LIME, and counterfactual explanations.
        </div>
      </div>
      <Link href="/dashboard/data" style={{ marginTop: 8, padding: '10px 24px', background: 'var(--color-accent)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
        Go to Data Hub →
      </Link>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function ExplainabilityPage() {
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  // SHAP local for row 0
  const [shapLocal, setShapLocal] = useState<{ base_value: number; prediction: number; shap_waterfall: LocalSHAP[] } | null>(null)
  const [shapLocal1, setShapLocal1] = useState<{ base_value: number; prediction: number; shap_waterfall: LocalSHAP[] } | null>(null)

  // LIME for row 0
  const [limeData, setLimeData] = useState<{ prediction: number; lime_weights: { label: string; weight: number }[] } | null>(null)

  // Counterfactual for row 0
  const [cfData, setCfData] = useState<{ original_risk: number; suggestions: CounterfactualSuggestion[] } | null>(null)

  const [xaiLoading, setXaiLoading] = useState(false)
  const [xaiError, setXaiError] = useState<string | null>(null)

  // AI Plain English summary
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('train_result')
    const id = localStorage.getItem('model_id')
    const g = localStorage.getItem('goal')
    if (raw) {
      try { setTrainResult(JSON.parse(raw)) } catch {}
    }
    setModelId(id)
    setGoal(g)
    setPageLoading(false)
  }, [])

  // Fetch XAI data once we have a model ID
  useEffect(() => {
    if (!modelId) return
    setXaiLoading(true)
    setXaiError(null)

    const isChurn = goal === 'churn_risk'

    Promise.allSettled([
      getSHAPLocal(modelId, 0),
      getSHAPLocal(modelId, 1),
      isChurn ? getLIMELocal(modelId, 0) : Promise.resolve(null),
      isChurn ? getCounterfactual(modelId, 0) : Promise.resolve(null),
    ]).then(([s0, s1, lime, cf]) => {
      if (s0.status === 'fulfilled') setShapLocal(s0.value)
      if (s1.status === 'fulfilled') setShapLocal1(s1.value)
      if (lime?.status === 'fulfilled' && lime.value) setLimeData(lime.value as any)
      if (cf?.status === 'fulfilled' && cf.value) setCfData(cf.value as any)
      if (s0.status === 'rejected') setXaiError('Failed to load SHAP explanations. Make sure the backend is running.')
      setXaiLoading(false)
    })
  }, [modelId, goal])

  const fetchAiSummary = () => {
    if (!modelId) return
    setAiSummaryLoading(true)
    setAiSummaryError(null)
    setAiSummary(null)
    getExplainSummary(modelId, 0)
      .then(r => { setAiSummary(r.summary); setAiSummaryLoading(false) })
      .catch(e => { setAiSummaryError(e.message ?? 'Failed to generate summary.'); setAiSummaryLoading(false) })
  }

  const isChurn = goal === 'churn_risk'
  const isSales = goal === 'sales_forecast'

  // Side-by-side: top 2 customers (churn only)
  const customer0 = trainResult?.customers?.[0]
  const customer1 = trainResult?.customers?.[1]

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Explainability Center</h1>
      </div>

      {pageLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px', height: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton h={16} w="70%" /><Skeleton h={12} w="50%" /><Skeleton h={180} />
          </div>)}
        </div>
      )}

      {!pageLoading && !trainResult && <NoModelState />}

      {!pageLoading && trainResult && (
        <>
          {xaiError && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, fontSize: 13, color: '#FF6B6B' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{xaiError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* SHAP Global Beeswarm */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>What's driving your AI? (Global)</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>SHAP beeswarm — average impact across all predictions</div>
              </div>
              {trainResult.shap_global && trainResult.shap_global.length > 0
                ? <ShapBeeswarm features={trainResult.shap_global} />
                : <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No SHAP data available</div>
              }
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#00E5A0' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5A0', display: 'inline-block' }} /> Increases prediction</span>
                <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#FF6B6B' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B6B', display: 'inline-block' }} /> Decreases prediction</span>
              </div>
            </div>

            {/* Local SHAP Waterfall */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                  {isChurn && customer0 ? `Why is ${customer0.name} at ${customer0.risk}% churn risk?` : 'Why was this prediction made?'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>SHAP waterfall — per-record explanation from baseline to final prediction</div>
              </div>
              {xaiLoading && <Skeleton h={160} />}
              {!xaiLoading && shapLocal && (
                <>
                  <LocalWaterfall baseValue={shapLocal.base_value} prediction={shapLocal.prediction} waterfall={shapLocal.shap_waterfall} isClassifier={isChurn} />
                  {shapLocal.shap_waterfall[0] && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,107,107,0.06)', borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: '#FF6B6B' }}>{shapLocal.shap_waterfall[0].label}</strong> is the biggest driver
                      {shapLocal.shap_waterfall[0].shap_value > 0 ? ', pushing risk up' : ', reducing risk by'}&nbsp;
                      {Math.abs(shapLocal.shap_waterfall[0].shap_value * 100).toFixed(0)}%.
                    </div>
                  )}
                </>
              )}
              {!xaiLoading && !shapLocal && !xaiError && (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>Loading…</div>
              )}
            </div>
          </div>

          {/* LIME + Counterfactual (churn only) */}
          {isChurn && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* LIME */}
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                    LIME Explanation{customer0 ? ` — ${customer0.name}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: '4px 8px', background: 'var(--color-bg-base)', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>
                    ℹ LIME builds a local linear model around this prediction. Use alongside SHAP for a cross-check.
                  </div>
                </div>
                {xaiLoading && <Skeleton h={180} />}
                {!xaiLoading && limeData && (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={limeData.lime_weights} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#7c8aa0' }} axisLine={false} tickLine={false} tickFormatter={v => `${(Number(v) * 100).toFixed(0)}%`} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#9aa0b0' }} axisLine={false} tickLine={false} width={140} />
                      <Tooltip
                        contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => [`${Number(v) > 0 ? '+' : ''}${(Number(v) * 100).toFixed(0)}%`, 'LIME weight']}
                      />
                      <Bar dataKey="weight" radius={[0, 3, 3, 0]}>
                        {limeData.lime_weights.map(entry => (
                          <Cell key={entry.label} fill={entry.weight < 0 ? '#4F9EFF' : '#FF6B6B'} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {!xaiLoading && !limeData && !xaiError && (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No LIME data available</div>
                )}
              </div>

              {/* Counterfactual */}
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>What Could Change This?</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Minimum changes that would reduce{customer0 ? ` ${customer0.name}'s` : ' this customer\'s'} churn risk
                  </div>
                </div>
                {xaiLoading && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><Skeleton h={56} /><Skeleton h={56} /><Skeleton h={56} /></div>}
                {!xaiLoading && cfData && cfData.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cfData.suggestions.slice(0, 3).map(c => (
                      <div key={c.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(0,229,160,0.06)', borderRadius: 8, border: '1px solid rgba(0,229,160,0.15)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 2 }}>If: {c.action}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>→ {c.original_risk_pct}% → {c.new_risk_pct}% risk</div>
                        </div>
                        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>{c.delta_pct}%</div>
                      </div>
                    ))}
                  </div>
                )}
                {!xaiLoading && cfData && cfData.suggestions.length === 0 && (
                  <div style={{ padding: '16px', background: 'rgba(0,229,160,0.04)', borderRadius: 8, border: '1px solid rgba(0,229,160,0.1)', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    No actionable interventions found for this customer's risk profile.
                  </div>
                )}
                {!xaiLoading && !cfData && !xaiError && (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>Loading counterfactuals…</div>
                )}
              </div>
            </div>
          )}

          {/* Sales model: no LIME/CF note */}
          {isSales && (
            <div style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(79,70,255,0.06)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--color-accent-light)' }}>Sales Forecast model:</strong> LIME and counterfactual analysis are designed for classification (churn) models. For forecasting, use the Global SHAP above and visit the <Link href="/dashboard/predictions" style={{ color: 'var(--color-accent-light)' }}>Predictions page</Link> to see the per-date SHAP waterfall.
            </div>
          )}

          {/* AI Plain English Summary */}
          <div style={{ background: 'linear-gradient(135deg, rgba(79,70,255,0.08), rgba(0,229,160,0.04))', border: '1px solid rgba(79,70,255,0.25)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} style={{ color: 'var(--color-accent-light)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Plain English Summary</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Claude explains what the AI is seeing — no jargon, just business insight</div>
                </div>
              </div>
              <button
                onClick={fetchAiSummary}
                disabled={aiSummaryLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: aiSummaryLoading ? 'var(--color-bg-base)' : 'var(--color-accent)', border: 'none', color: aiSummaryLoading ? 'var(--color-text-muted)' : '#fff', fontSize: 12, fontWeight: 700, cursor: aiSummaryLoading ? 'wait' : 'pointer', flexShrink: 0 }}
              >
                {aiSummaryLoading
                  ? <><div style={{ width: 12, height: 12, border: '2px solid #666', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Generating…</>
                  : aiSummary ? <><RefreshCw size={12} /> Regenerate</> : <><Sparkles size={12} /> Explain in Plain English</>
                }
              </button>
            </div>

            {!aiSummary && !aiSummaryLoading && !aiSummaryError && (
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Click <strong style={{ color: 'var(--color-accent-light)' }}>Explain in Plain English</strong> to have Claude read all the SHAP, LIME, and counterfactual data above and summarise what it means for your business — in language anyone can understand.
              </div>
            )}

            {aiSummaryLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                <Skeleton h={16} w="90%" />
                <Skeleton h={16} w="75%" />
                <Skeleton h={16} w="85%" />
                <Skeleton h={16} w="60%" />
              </div>
            )}

            {aiSummaryError && (
              <div style={{ padding: '12px 16px', background: 'rgba(255,107,107,0.08)', borderRadius: 8, border: '1px solid rgba(255,107,107,0.25)', fontSize: 13, color: '#FF6B6B' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{aiSummaryError}</span>
              </div>
            )}

            {aiSummary && !aiSummaryLoading && (
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                {aiSummary.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: i > 0 ? '12px 0 0' : 0 }}>{para}</p>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-side comparison (churn only) */}
          {isChurn && customer0 && customer1 && (
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Side-by-Side Comparison</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Why do two similar customers have different churn scores?</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'start' }}>
                {[
                  { customer: customer0, shapData: shapLocal },
                  { customer: customer1, shapData: shapLocal1 },
                ].map(({ customer, shapData }, i) => (
                  <div key={customer.id} style={{ padding: '16px', background: 'var(--color-bg-base)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${customer.risk >= 80 ? '#FF6B6B' : '#FFC85C'}30`, border: `1px solid ${customer.risk >= 80 ? '#FF6B6B' : '#FFC85C'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: customer.risk >= 80 ? '#FF6B6B' : '#FFC85C' }}>
                        {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{customer.name}</div>
                        <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, color: customer.risk >= 80 ? '#FF6B6B' : '#FFC85C' }}>{customer.risk}% risk</div>
                      </div>
                    </div>
                    {(shapData?.shap_waterfall ?? customer.local_shap).slice(0, 3).map((f: any) => (
                      <div key={f.label || f.feature} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{f.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: (f.shap_value ?? f.shap_value) < 0 ? '#4F9EFF' : '#FF6B6B' }}>
                          {(f.shap_value) > 0 ? '+' : ''}{((f.shap_value) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '0 8px' }}>
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>↔</div>
                    <div>{Math.abs(customer0.risk - customer1.risk)}% risk<br />difference</div>
                    {customer1.risk < customer0.risk && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#00E5A0' }}>{customer1.name.split(' ')[0]} is lower risk</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
