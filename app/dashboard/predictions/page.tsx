'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, Users, Info, Database, AlertCircle, Download, FileSpreadsheet, ExternalLink, CheckCircle2, Link2 } from 'lucide-react'
import {
  getModelPredictions,
  type SHAPFeature, type ForecastPoint, type ChurnCustomer,
} from '@/lib/api'
import {
  exportToExcel,
  exportToSheets,
  getConnectedIntegrations,
  type SheetsExportResult,
} from '@/lib/integrations'

const riskColor = (r: number) => r >= 80 ? '#FF6B6B' : r >= 60 ? '#FFC85C' : '#00E5A0'
const segmentLabel = (revenue: number) => revenue >= 4000 ? 'VIP' : 'Regular'

// ── SHAP Waterfall ────────────────────────────────────────────────────────
function SHAPWaterfall({ features, baseline }: { features: SHAPFeature[]; baseline: number }) {
  const topN = [...features]
    .sort((a, b) => Math.abs(b.raw) - Math.abs(a.raw))
    .slice(0, 6)

  const maxAbs = Math.max(...topN.map(f => Math.abs(f.raw)), 1)
  const shapTotal = features.reduce((s, f) => s + f.raw, 0)
  const predicted = baseline + shapTotal

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#00E5A0', display: 'inline-block', opacity: 0.85 }} />
          Increases prediction
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FF6B6B', display: 'inline-block', opacity: 0.85 }} />
          Decreases prediction
        </span>
      </div>

      {/* Feature rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {topN.map((f, i) => {
          const label = f.label || f.feature
          const truncated = label.length > 30 ? label.slice(0, 30) + '…' : label
          const pct = (Math.abs(f.raw) / maxAbs) * 100
          const isPos = f.raw >= 0
          const color = isPos ? '#00E5A0' : '#FF6B6B'

          return (
            <div key={f.feature + i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Rank bubble */}
              <span style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.05)',
                fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
              }}>
                {i + 1}
              </span>

              {/* Feature name */}
              <span style={{
                width: 200, flexShrink: 0, fontSize: 12,
                color: 'var(--color-text-secondary)',
                textAlign: 'right', lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}>
                {truncated}
              </span>

              {/* Bar track */}
              <div style={{
                flex: 1, height: 10, borderRadius: 5,
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                  borderRadius: 5,
                  transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>

              {/* Value */}
              <span style={{
                width: 76, flexShrink: 0, textAlign: 'right',
                fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700,
                color,
              }}>
                {isPos ? '+' : ''}${Math.abs(f.raw).toFixed(0)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Baseline → Predicted summary strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 22, padding: '14px 20px',
        background: 'rgba(255,255,255,0.025)',
        borderRadius: 10, border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Baseline</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              ${baseline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>+</div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Feature Impact</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: shapTotal >= 0 ? '#00E5A0' : '#FF6B6B' }}>
              {shapTotal >= 0 ? '+' : ''}${shapTotal.toFixed(0)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Predicted</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#00E5A0', fontFamily: 'var(--font-mono)' }}>
            ${predicted.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Export Panel ──────────────────────────────────────────────────────────
function ExportPanel({ modelId }: { modelId: string }) {
  const [sheetsConnected, setSheetsConnected] = useState(false)
  const [spreadsheetInput, setSpreadsheetInput] = useState('')
  const [exporting, setExporting] = useState<'excel' | 'sheets' | null>(null)
  const [sheetResult, setSheetResult] = useState<SheetsExportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getConnectedIntegrations()
      .then(ids => setSheetsConnected(ids.includes('google_sheets')))
      .catch(() => {})
  }, [])

  async function handleExcel() {
    setExporting('excel')
    setError(null)
    try {
      await exportToExcel(modelId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Excel export failed')
    } finally {
      setExporting(null)
    }
  }

  async function handleSheets() {
    setExporting('sheets')
    setError(null)
    setSheetResult(null)
    try {
      // Accept full URL or bare spreadsheet ID
      let spreadsheetId: string | undefined
      const trimmed = spreadsheetInput.trim()
      if (trimmed) {
        const match = trimmed.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
        spreadsheetId = match?.[1] ?? trimmed
      }
      const result = await exportToSheets(modelId, spreadsheetId)
      setSheetResult(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google Sheets export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 22px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(79,70,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={14} style={{ color: 'var(--color-accent-light)' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Export Predictions</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>Download your model data or sync it to a spreadsheet</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Excel ── */}
        <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,168,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileSpreadsheet size={16} style={{ color: '#00A852' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Download Excel</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Formatted .xlsx with predictions & SHAP</div>
            </div>
          </div>
          <button
            onClick={handleExcel}
            disabled={exporting === 'excel'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, background: exporting === 'excel' ? 'rgba(0,168,82,0.08)' : 'rgba(0,168,82,0.14)', border: '1px solid rgba(0,168,82,0.3)', color: '#00A852', fontSize: 13, fontWeight: 600, cursor: exporting === 'excel' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: exporting === 'excel' ? 0.7 : 1 }}
          >
            {exporting === 'excel' ? (
              <>
                <div style={{ width: 12, height: 12, border: '2px solid #00A852', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Generating…
              </>
            ) : (
              <><Download size={13} /> Download .xlsx</>
            )}
          </button>
        </div>

        {/* ── Google Sheets ── */}
        <div style={{ background: 'var(--color-bg-base)', border: `1px solid ${sheetsConnected ? 'rgba(66,133,244,0.3)' : 'var(--color-border)'}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(66,133,244,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" fill="rgba(66,133,244,0.2)" stroke="#4285F4" strokeWidth="1.5"/>
                <line x1="4" y1="8" x2="20" y2="8" stroke="#4285F4" strokeWidth="1" opacity="0.6"/>
                <line x1="4" y1="13" x2="20" y2="13" stroke="#4285F4" strokeWidth="1" opacity="0.6"/>
                <line x1="9" y1="8" x2="9" y2="22" stroke="#4285F4" strokeWidth="1" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Sync to Google Sheets</div>
                {sheetsConnected && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,229,160,0.12)', color: 'var(--color-success)', fontWeight: 600 }}>Connected</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {sheetsConnected ? 'Push predictions to a spreadsheet' : 'Connect Google Sheets in Agents → Integrations'}
              </div>
            </div>
          </div>

          {sheetsConnected ? (
            <>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Link2 size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Paste sheet URL or ID (blank = create new)"
                    value={spreadsheetInput}
                    onChange={e => setSpreadsheetInput(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px 8px 28px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 11, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <button
                onClick={handleSheets}
                disabled={exporting === 'sheets'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, background: exporting === 'sheets' ? 'rgba(66,133,244,0.08)' : 'rgba(66,133,244,0.14)', border: '1px solid rgba(66,133,244,0.3)', color: '#4285F4', fontSize: 13, fontWeight: 600, cursor: exporting === 'sheets' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: exporting === 'sheets' ? 0.7 : 1 }}
              >
                {exporting === 'sheets' ? (
                  <>
                    <div style={{ width: 12, height: 12, border: '2px solid #4285F4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Syncing…
                  </>
                ) : (
                  <><ExternalLink size={13} /> Sync to Sheets</>
                )}
              </button>
            </>
          ) : (
            <Link href="/dashboard/agents" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 7, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
              Connect in Agents Hub →
            </Link>
          )}

          {/* Success */}
          {sheetResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 7, fontSize: 12 }}>
              <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{sheetResult.rows_written} rows written</span>
              <a href={sheetResult.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#4285F4', fontWeight: 600, textDecoration: 'none', fontSize: 11 }}>
                Open sheet <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 7, fontSize: 12, color: 'var(--color-danger)' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  )
}

// ── No model prompt ───────────────────────────────────────────────────────
function NoModelPrompt() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Database size={24} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>No model trained yet</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 360 }}>Upload a CSV and train a model to see real predictions here.</div>
      </div>
      <Link href="/dashboard/data" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
        <Database size={14} /> Go to Data Hub
      </Link>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const [tab, setTab] = useState<'forecast' | 'churn'>('forecast')
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)

  const [modelId, setModelId] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [forecastSeries, setForecastSeries] = useState<ForecastPoint[]>([])
  const [shapGlobal, setShapGlobal] = useState<SHAPFeature[]>([])
  const [customers, setCustomers] = useState<ChurnCustomer[]>([])
  const [metrics, setMetrics] = useState<{
    accuracy?: number; mae?: number; rmse?: number; r2?: number; auc?: number
  }>({})

  useEffect(() => {
    const id = localStorage.getItem('model_id')
    const g = localStorage.getItem('goal')
    if (!id) { setLoading(false); return }
    setModelId(id)
    setGoal(g)
    // Set initial tab based on goal
    if (g === 'churn_risk') setTab('churn')
    else setTab('forecast')

    getModelPredictions(id)
      .then(data => {
        setShapGlobal(data.shap_global ?? [])
        setForecastSeries(data.forecast_series ?? [])
        setCustomers(data.customers ?? [])
        setMetrics({
          accuracy: data.accuracy,
          mae: data.mae,
          rmse: data.rmse,
          r2: data.r2,
          auc: data.auc,
        })
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Compute SHAP waterfall baseline from actual values
  const avgActual = forecastSeries.length > 0
    ? forecastSeries.filter(p => p.actual != null).reduce((s, p) => s + (p.actual ?? 0), 0) /
      Math.max(1, forecastSeries.filter(p => p.actual != null).length)
    : 0
  const shapSum = shapGlobal.reduce((s, f) => s + f.raw, 0)
  const shapBaseline = avgActual > 0 ? avgActual - shapSum : 12000

  // Format forecast series dates for display
  const chartData = forecastSeries.map(p => ({
    date: p.date ? p.date.slice(5) : '', // MM-DD
    actual: p.actual ?? null,
    predicted: p.predicted ?? null,
    upper: p.upper ?? null,
    lower: p.lower ?? null,
  }))

  // Find the "today" separator (last actual → first predicted)
  const todayDate = (() => {
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (chartData[i].actual != null) return chartData[i].date
    }
    return null
  })()

  const accuracyPct = metrics.accuracy != null
    ? (metrics.accuracy * 100).toFixed(1) + '%'
    : metrics.auc != null
    ? 'AUC ' + metrics.auc.toFixed(3)
    : '—'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--color-text-muted)', fontSize: 14 }}>
        <div style={{ width: 18, height: 18, border: '2px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        Loading predictions…
      </div>
    )
  }

  if (!modelId) return <NoModelPrompt />

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: 'var(--color-danger)' }} />
        <div style={{ fontSize: 14, color: 'var(--color-danger)', fontWeight: 600 }}>Failed to load predictions</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 400 }}>{error}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Make sure the backend is running: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>cd backend && ./start.sh</code></div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Prediction Engine</h1>
      </div>

      {/* Export Panel */}
      <ExportPanel modelId={modelId} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
        {[
          { key: 'forecast', label: 'Sales Forecast', icon: TrendingUp },
          { key: 'churn', label: 'Customer Churn Risk', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as 'forecast' | 'churn')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--color-accent)' : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: tab === key ? 600 : 400, color: tab === key ? 'var(--color-accent-light)' : 'var(--color-text-muted)', transition: 'all 0.15s', marginBottom: -1 }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Sales Forecast ── */}
      {tab === 'forecast' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {goal === 'churn_risk' && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,200,92,0.07)', border: '1px solid rgba(255,200,92,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--color-warning)' }}>
              Your trained model is for <strong>Churn Risk</strong>, not Sales Forecast. Switch to the Churn Risk tab, or upload a date+revenue CSV and retrain.
            </div>
          )}

          {/* Chart */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Revenue Forecast</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  XGBoost regressor · {accuracyPct} accuracy
                  {metrics.mae != null && ` · MAE $${metrics.mae.toFixed(0)}`}
                  {metrics.r2 != null && ` · R² ${metrics.r2.toFixed(3)}`}
                  {' · 95% confidence interval shown'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-muted)', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 16, height: 2, background: '#4F46FF', display: 'inline-block' }} /> Actual</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 16, height: 2, background: '#00E5A0', display: 'inline-block' }} /> Predicted</span>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46FF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7c8aa0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7c8aa0' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, padding: '8px 12px' }}
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null
                      const relevant = payload.filter((p: any) => p.dataKey === 'actual' || p.dataKey === 'predicted')
                      if (!relevant.length) return null
                      return (
                        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                          <div style={{ color: 'var(--color-text-muted)', marginBottom: 6, fontSize: 11 }}>{label}</div>
                          {relevant.map((p: any) => (
                            <div key={p.dataKey} style={{ color: p.dataKey === 'actual' ? '#7C74FF' : '#00E5A0', fontWeight: 600 }}>
                              {p.dataKey === 'actual' ? 'Actual' : 'Predicted'}: ${p.value != null ? Number(p.value).toLocaleString() : '—'}
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                  {todayDate && <ReferenceLine x={todayDate} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: 'Today', fill: '#7c8aa0', fontSize: 10 }} />}
                  <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" activeDot={false} dot={false} />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="white" fillOpacity={0} activeDot={false} dot={false} />
                  <Area type="monotone" dataKey="actual" stroke="#4F46FF" strokeWidth={2} fill="url(#actGrad)" dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#00E5A0" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No forecast data available — retrain with a sales dataset.
              </div>
            )}
          </div>

          {/* SHAP Explanation */}
          {shapGlobal.length > 0 && (
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>What's driving this forecast?</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Top features ranked by impact on the revenue prediction — SHAP values</div>
              </div>
              <SHAPWaterfall features={shapGlobal} baseline={shapBaseline} />
            </div>
          )}

          {/* Metrics card */}
          {(metrics.mae != null || metrics.r2 != null) && (
            <div style={{ background: 'rgba(79,70,255,0.06)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 12, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={13} style={{ color: 'var(--color-accent-light)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent-light)' }}>Model Performance</span>
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {metrics.accuracy != null && (
                  <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Accuracy</div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>{(metrics.accuracy * 100).toFixed(1)}%</div></div>
                )}
                {metrics.mae != null && (
                  <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Mean Abs. Error</div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>${metrics.mae.toFixed(0)}</div></div>
                )}
                {metrics.rmse != null && (
                  <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>RMSE</div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>${metrics.rmse.toFixed(0)}</div></div>
                )}
                {metrics.r2 != null && (
                  <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>R² Score</div><div style={{ fontSize: 22, fontWeight: 800, color: metrics.r2 >= 0.8 ? 'var(--color-success)' : 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>{metrics.r2.toFixed(3)}</div></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Churn Risk ── */}
      {tab === 'churn' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {goal === 'sales_forecast' && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,200,92,0.07)', border: '1px solid rgba(255,200,92,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--color-warning)' }}>
              Your trained model is for <strong>Sales Forecast</strong>, not Churn Risk. Switch to the Sales Forecast tab, or upload a customer CSV and retrain.
            </div>
          )}

          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>High-Risk Customers</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                XGBoost classifier · SHAP explanation per customer · Sorted by churn probability
                {metrics.auc != null && ` · AUC ${metrics.auc.toFixed(3)}`}
              </div>
            </div>

            {customers.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No customers scored — retrain with a customer dataset to see churn predictions.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 110px 120px 90px', gap: 12, padding: '6px 12px', fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  <span>ID</span><span>Customer</span><span>Risk Score</span><span>At-Risk Rev.</span><span>Days Inactive</span><span>Segment</span>
                </div>

                {customers.map(c => {
                  const seg = segmentLabel(c.revenue)
                  const topDriver = c.local_shap?.slice().sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))[0]
                  const topNegDriver = c.local_shap?.filter(s => s.shap_value > 0).sort((a, b) => b.shap_value - a.shap_value)[0]

                  return (
                    <div key={c.id}>
                      <div
                        onClick={() => setExpandedCustomer(expandedCustomer === c.id ? null : c.id)}
                        style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 110px 120px 90px', gap: 12, padding: '12px', background: expandedCustomer === c.id ? 'rgba(79,70,255,0.06)' : 'var(--color-bg-base)', borderRadius: 8, cursor: 'pointer', alignItems: 'center', border: `1px solid ${expandedCustomer === c.id ? 'rgba(79,70,255,0.2)' : 'transparent'}` }}
                      >
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{c.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${riskColor(c.risk)}40, ${riskColor(c.risk)}20)`, border: `1px solid ${riskColor(c.risk)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: riskColor(c.risk), flexShrink: 0 }}>
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${c.risk}%`, background: riskColor(c.risk), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: riskColor(c.risk), fontFamily: 'var(--font-mono)', minWidth: 36 }}>{c.risk}%</span>
                        </div>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: 600 }}>${c.revenue.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: c.days_inactive > 45 ? '#FF6B6B' : c.days_inactive > 35 ? '#FFC85C' : 'var(--color-text-secondary)' }}>{c.days_inactive} days</span>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: seg === 'VIP' ? 'rgba(79,70,255,0.15)' : 'var(--color-bg-elevated)', color: seg === 'VIP' ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontWeight: 600 }}>{seg}</span>
                      </div>

                      {expandedCustomer === c.id && (
                        <div style={{ margin: '4px 0 8px', padding: '16px', background: 'rgba(79,70,255,0.04)', borderRadius: 8, border: '1px solid rgba(79,70,255,0.15)' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            SHAP Explanation — Top churn drivers for {c.name}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(c.local_shap ?? []).slice(0, 4).map((s, si) => {
                              const maxAbs = Math.max(...(c.local_shap ?? []).map(x => Math.abs(x.shap_value)))
                              const pct = maxAbs > 0 ? (Math.abs(s.shap_value) / maxAbs) * 100 : 0
                              const color = s.shap_value > 0 ? '#FF6B6B' : '#00E5A0'
                              return (
                                <div key={s.feature + si} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 220, flexShrink: 0 }}>
                                    {s.label || s.feature}: <strong style={{ color: 'var(--color-text-primary)' }}>{s.feature_value.toFixed(1)}</strong>
                                  </span>
                                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color, fontWeight: 700, minWidth: 48, textAlign: 'right' }}>
                                    {s.shap_value > 0 ? '+' : ''}{s.shap_value.toFixed(3)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          {topNegDriver && (
                            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(0,229,160,0.06)', borderRadius: 6, border: '1px solid rgba(0,229,160,0.15)', fontSize: 12, color: 'var(--color-success)' }}>
                              <strong>Top intervention:</strong> Reducing <em>{topNegDriver.label || topNegDriver.feature}</em> could lower this customer's churn risk by roughly {Math.round(topNegDriver.shap_value * 100)}%.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AUC card */}
          {metrics.auc != null && (
            <div style={{ background: 'rgba(79,70,255,0.06)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>AUC-ROC</div><div style={{ fontSize: 28, fontWeight: 800, color: metrics.auc >= 0.8 ? 'var(--color-success)' : 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>{metrics.auc.toFixed(3)}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Customers Scored</div><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{customers.length}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>High-Risk (&gt;70%)</div><div style={{ fontSize: 28, fontWeight: 800, color: '#FF6B6B', fontFamily: 'var(--font-mono)' }}>{customers.filter(c => c.risk >= 70).length}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>At-Risk Revenue</div><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>${customers.filter(c => c.risk >= 70).reduce((s, c) => s + c.revenue, 0).toLocaleString()}</div></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
