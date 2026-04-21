'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, CheckCircle, AlertTriangle, Zap,
  TrendingUp, Users, ArrowRight, X, RefreshCw, Download,
} from 'lucide-react'
import {
  uploadCSV, trainModel,
  type UploadResult, type TrainResult, type ColumnProfile,
} from '@/lib/api'

// ── Helpers ────────────────────────────────────────────────────────────────
const GOAL_META: Record<string, { label: string; desc: string; icon: any; color: string; requiredHints: string[] }> = {
  sales_forecast: {
    label: 'Sales Forecast',
    desc: 'Predict future revenue with confidence intervals. Needs: date column + revenue column.',
    icon: TrendingUp,
    color: '#4F46FF',
    requiredHints: ['date', 'revenue'],
  },
  churn_risk: {
    label: 'Customer Churn Risk',
    desc: 'Score every customer\'s churn probability. Needs: days_since_last_purchase or similar inactivity measure.',
    icon: Users,
    color: '#FF6B6B',
    requiredHints: ['days_since', 'inactive'],
  },
}

const qColor = (s: number) => s >= 80 ? '#00E5A0' : s >= 60 ? '#FFC85C' : '#FF6B6B'
const typeColor: Record<string, string> = { numeric: '#4F46FF', date: '#00E5A0', categorical: '#FFC85C', text: '#7c8aa0' }

type Stage = 'idle' | 'uploading' | 'profiled' | 'training' | 'done' | 'error'

export default function DataPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [upload, setUpload] = useState<UploadResult | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trainLog, setTrainLog] = useState<string[]>([])

  // ── Upload handler ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setStage('uploading')
    try {
      const result = await uploadCSV(file)
      setUpload(result)
      setSelectedGoal(result.profile.suggested_goals[0] ?? 'sales_forecast')
      setStage('profiled')
    } catch (e: any) {
      setError(e.message ?? 'Upload failed. Is the backend running?')
      setStage('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  // ── Train handler ───────────────────────────────────────────────────────
  const handleTrain = async () => {
    if (!upload || !selectedGoal) return
    setStage('training')
    setTrainLog([])

    const steps = [
      'Parsing dataset…',
      'Detecting column types and feature candidates…',
      'Engineering lag features and date signals…',
      'Training model (cross-validation)…',
      'Computing SHAP values across training set…',
      'Generating predictions…',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) setTrainLog(l => [...l, steps[i++]])
      else clearInterval(interval)
    }, 600)

    try {
      const result = await trainModel(upload.dataset_id, selectedGoal)
      clearInterval(interval)
      setTrainLog(l => [...l, '__done__'])
      setTrainResult(result)

      // Persist to localStorage for other dashboard pages
      localStorage.setItem('model_id', result.model_id)
      localStorage.setItem('goal', result.goal)
      localStorage.setItem('train_result', JSON.stringify(result))

      setStage('done')
    } catch (e: any) {
      clearInterval(interval)
      setError(e.message ?? 'Training failed')
      setStage('error')
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────
  const reset = () => {
    setStage('idle')
    setUpload(null)
    setTrainResult(null)
    setError(null)
    setTrainLog([])
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Data Connection Hub</h1>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: '#FF6B6B', marginTop: 1, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FF6B6B', marginBottom: 3 }}>Error</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{error}</div>
            {error.includes('backend') && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                Start the backend: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>cd backend && ./start.sh</code>
              </div>
            )}
          </div>
          <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Stage: idle / uploading ── */}
      {(stage === 'idle' || stage === 'uploading') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'var(--color-accent-dim)' : 'var(--color-bg-elevated)',
              transition: 'all 0.15s',
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} style={{ display: 'none' }} />
            {stage === 'uploading' ? (
              <>
                <div style={{ width: 36, height: 36, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Uploading and profiling…</div>
              </>
            ) : (
              <>
                <Upload size={36} style={{ color: 'var(--color-accent-light)', margin: '0 auto 16px', display: 'block' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Drop your CSV or Excel file here</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Up to 50MB · CSV, XLSX, XLS</div>
                <div style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--color-accent)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Choose File</div>
              </>
            )}
          </div>

          {/* Sample files */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14 }}>Try a sample file</div>
            {[
              { name: 'sales_data.csv', desc: '270 days of revenue data', path: '/backend/sample_data/sales_data.csv', goal: 'Sales Forecast' },
              { name: 'churn_data.csv', desc: '300 customers with risk labels', path: '/backend/sample_data/churn_data.csv', goal: 'Churn Risk' },
            ].map(f => (
              <div key={f.name} style={{ padding: '10px 12px', background: 'var(--color-bg-base)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FileText size={13} style={{ color: 'var(--color-accent-light)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{f.name}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>{f.desc} · {f.goal}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  File at: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-elevated)', padding: '1px 5px', borderRadius: 3 }}>backend/sample_data/{f.name}</code>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>These files are already on your machine in the <code style={{ fontFamily: 'var(--font-mono)' }}>backend/sample_data/</code> directory.</div>
          </div>
        </div>
      )}

      {/* ── Stage: profiled ── */}
      {stage === 'profiled' && upload && (
        <div style={{ display: 'grid', gap: 20 }}>

          {/* Profile summary */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FileText size={15} style={{ color: 'var(--color-accent-light)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{upload.filename}</span>
                </div>
                {upload.profile.date_range && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Date range: {upload.profile.date_range}</div>}
              </div>
              <button onClick={reset} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={11} /> Remove
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Rows', value: upload.profile.row_count.toLocaleString() },
                { label: 'Columns', value: upload.profile.column_count },
                { label: 'Missing %', value: `${upload.profile.missing_pct}%`, color: upload.profile.missing_pct > 10 ? '#FFC85C' : '#00E5A0' },
                { label: 'Quality Score', value: `${upload.profile.quality_score}/100`, color: qColor(upload.profile.quality_score) },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--color-bg-base)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: color ?? 'var(--color-text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Column table */}
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Detected Columns</div>
            <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
              {upload.profile.columns.map((col: ColumnProfile) => (
                <div key={col.name} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 1fr', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--color-bg-base)', borderRadius: 7 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{col.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{col.friendly_name}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: `${typeColor[col.type]}15`, color: typeColor[col.type], fontWeight: 600, textAlign: 'center' }}>{col.type}</span>
                  <span style={{ fontSize: 11, color: col.null_pct > 10 ? '#FFC85C' : 'var(--color-text-muted)', textAlign: 'center' }}>{col.null_pct}% null</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>e.g. {col.sample.slice(0, 2).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal selection */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14 }}>Select Prediction Goal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {Object.entries(GOAL_META).map(([key, meta]) => {
                const Icon = meta.icon
                const isSuggested = upload.profile.suggested_goals.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedGoal(key)}
                    style={{ textAlign: 'left', padding: '16px', borderRadius: 10, border: `2px solid ${selectedGoal === key ? meta.color : 'var(--color-border)'}`, background: selectedGoal === key ? `${meta.color}10` : 'var(--color-bg-base)', cursor: 'pointer', position: 'relative' }}
                  >
                    {isSuggested && (
                      <div style={{ position: 'absolute', top: -10, right: 10, background: meta.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100 }}>Recommended</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Icon size={16} style={{ color: meta.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{meta.desc}</div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleTrain}
              disabled={!selectedGoal}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: selectedGoal ? 'pointer' : 'not-allowed', opacity: selectedGoal ? 1 : 0.5 }}
            >
              <Zap size={15} /> Train Model with Real SHAP
            </button>
          </div>
        </div>
      )}

      {/* ── Stage: training ── */}
      {stage === 'training' && (
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Training {GOAL_META[selectedGoal]?.label} model…</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {trainLog.map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: line === '__done__' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {line === '__done__' ? <CheckCircle size={13} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 13, height: 13, border: '2px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                {line === '__done__' ? 'Done' : line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stage: done ── */}
      {stage === 'done' && trainResult && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Model trained successfully</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{trainResult.algorithm} · {trainResult.training_rows.toLocaleString()} training rows · {trainResult.feature_count} features</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Accuracy', value: `${trainResult.accuracy}%` },
                ...(trainResult.goal === 'sales_forecast' ? [
                  { label: 'MAE', value: `$${trainResult.mae?.toFixed(0) ?? '—'}` },
                  { label: 'R²', value: trainResult.r2?.toFixed(3) ?? '—' },
                ] : [
                  { label: 'AUC', value: trainResult.auc?.toFixed(3) ?? '—' },
                  { label: 'High Risk', value: String(trainResult.high_risk_count ?? '—') },
                ]),
                { label: 'Features', value: String(trainResult.feature_count) },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-bg-base)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16, padding: '10px 14px', background: 'rgba(0,229,160,0.04)', borderRadius: 8, border: '1px solid rgba(0,229,160,0.12)' }}>
              <strong style={{ color: 'var(--color-success)' }}>AI Report Card:</strong> {trainResult.report_card}
            </div>

            {/* Top SHAP factors */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Top SHAP Factors (Global)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {trainResult.shap_global.slice(0, 6).map(f => (
                  <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 200, flexShrink: 0 }}>{f.label}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.importance}%`, background: 'var(--color-accent)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent-light)', minWidth: 36 }}>{f.importance}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => router.push('/dashboard/predictions')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                View Live Predictions <ArrowRight size={14} />
              </button>
              <button
                onClick={reset}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <RefreshCw size={13} /> Upload different file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
