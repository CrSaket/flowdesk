'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Download, Sparkles, Clock, TrendingUp, Users, AlertTriangle, ChevronDown, ChevronUp, Database } from 'lucide-react'
import Link from 'next/link'
import { generateReport, type GeneratedReport } from '@/lib/api'

// ── PDF export (print-based, zero deps) ───────────────────────────────────
function exportToPDF(report: GeneratedReport) {
  const win = window.open('', '_blank')
  if (!win) return
  const sentimentColor: Record<string, string> = { positive: '#16a34a', warning: '#d97706', negative: '#dc2626' }
  const insightsHtml = report.insights.map((ins, i) => `
    <div class="insight">
      <div class="insight-title" style="color:${sentimentColor[ins.sentiment] ?? '#374151'}">
        ${i + 1}. ${ins.title}
      </div>
      <p>${ins.body}</p>
      <div class="driver">Key driver: ${ins.driver}</div>
    </div>`).join('')
  const recsHtml = report.recommendations.map((r, i) => `
    <div class="rec"><span class="rec-num">${i + 1}</span>${r}</div>`).join('')

  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"><title>FlowDesk AI Report — ${report.date_range}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; padding: 48px 56px; max-width: 760px; margin: 0 auto; }
      .header { border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 28px; }
      .brand { font-size: 12px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
      h1 { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 8px; }
      .meta { font-size: 12px; color: #6b7280; }
      .summary { background: #f0f0ff; border-left: 4px solid #4F46E5; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-bottom: 28px; font-size: 14px; color: #1f2937; line-height: 1.7; }
      .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 14px; }
      .insight { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; margin-bottom: 10px; }
      .insight-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
      .insight p { font-size: 13px; color: #374151; line-height: 1.6; margin-bottom: 8px; }
      .driver { font-size: 11px; color: #6b7280; background: #e5e7eb; border-radius: 4px; display: inline-block; padding: 3px 8px; }
      .rec { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; margin-bottom: 8px; font-size: 13px; color: #065f46; line-height: 1.5; }
      .rec-num { background: #10b981; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
      .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
    </style>
  </head><body>
    <div class="header">
      <div class="brand">FlowDesk · AI Business Brief</div>
      <h1>${report.headline}</h1>
      <div class="meta">${report.date_range} · Generated ${report.generated_at} · Audience: ${report.audience}</div>
    </div>
    <div class="summary">${report.summary}</div>
    <div class="section-title">Key Insights</div>
    ${insightsHtml}
    <div style="margin-top:28px">
    <div class="section-title">Recommended Actions</div>
    ${recsHtml}
    </div>
    <div class="footer">
      <span>FlowDesk AI — grounded in your actual data</span>
      <span>Powered by Claude (Anthropic)</span>
    </div>
  </body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, radius = 6 }: { w?: string | number, h?: number, radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

// Sentiment indicator rendered as a small colored dot instead of emoji
function SentimentDot({ sentiment }: { sentiment: string }) {
  const color = sentiment === 'positive' ? '#00E5A0' : sentiment === 'negative' ? '#FF6B6B' : '#FFC85C'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: 6,
      background: `${color}18`, border: `1px solid ${color}30`,
      flexShrink: 0,
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {sentiment === 'positive'
          ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
          : sentiment === 'negative'
          ? <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>
          : <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
        }
      </svg>
    </span>
  )
}
const sentimentColor: Record<string, string> = { positive: '#00E5A0', warning: '#FFC85C', negative: '#FF6B6B' }

function NoModelState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Database size={28} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>No model trained yet</div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          Train a model in the Data Hub first — reports are grounded in your actual AI results.
        </div>
      </div>
      <Link href="/dashboard/data" style={{ marginTop: 8, padding: '10px 24px', background: 'var(--color-accent)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
        Go to Data Hub →
      </Link>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [modelId, setModelId] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [report, setReport] = useState<GeneratedReport | null>(null)

  const [audience, setAudience] = useState('owner')
  const [dateRange, setDateRange] = useState('Last 7 days')
  const [expandedInsight, setExpandedInsight] = useState<number | null>(0)

  useEffect(() => {
    const id = localStorage.getItem('model_id')
    setModelId(id)
    setPageLoading(false)
  }, [])

  const handleGenerate = async () => {
    if (!modelId || generating) return
    setGenerating(true)
    setGenError(null)
    setReport(null)
    setExpandedInsight(0)
    try {
      const result = await generateReport(modelId, audience, dateRange)
      setReport(result)
    } catch (e: any) {
      setGenError(e.message ?? 'Failed to generate report.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 4 }}>Reports</h1>
      </div>

      {pageLoading && <Skeleton h={400} />}

      {!pageLoading && !modelId && <NoModelState />}

      {!pageLoading && modelId && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

          {/* Main report area */}
          <div>
            {/* Empty / generating state */}
            {!report && (
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', minHeight: 360 }}>
                {generating ? (
                  <>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 28, height: 28, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Generating your report…</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 340 }}>
                        Claude is reading your model results, SHAP drivers, and predictions to write a business brief grounded in your actual data.
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
                      <Skeleton h={14} w="90%" /><Skeleton h={14} w="75%" /><Skeleton h={14} w="85%" />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={26} style={{ color: 'var(--color-accent-light)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Your AI brief is ready to generate</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 360 }}>
                        Configure the options on the right, then click <strong style={{ color: 'var(--color-text-primary)' }}>Generate Report</strong>. Claude will turn your model results into a plain-English business brief.
                      </div>
                    </div>
                    {genError && (
                      <div style={{ padding: '12px 16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, fontSize: 13, color: '#FF6B6B', maxWidth: 400 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{genError}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Generated report */}
            {report && !generating && (
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '24px 26px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Sparkles size={15} style={{ color: 'var(--color-accent-light)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        AI Business Brief · {report.audience.charAt(0).toUpperCase() + report.audience.slice(1)} View
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                      {report.headline}
                    </h2>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={11} /> {report.date_range} · Generated {report.generated_at}
                    </div>
                  </div>
                  <button
                    onClick={() => exportToPDF(report)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600, flexShrink: 0 }}
                  >
                    <Download size={12} /> Export PDF
                  </button>
                </div>

                {/* Summary */}
                <div style={{ background: 'rgba(79,70,255,0.05)', border: '1px solid rgba(79,70,255,0.15)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{report.summary}</p>
                </div>

                {/* Insights */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Key Insights</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {report.insights.map((insight, i) => {
                      const expanded = expandedInsight === i
                      const color = sentimentColor[insight.sentiment] ?? '#00E5A0'
                      return (
                        <div key={i} style={{ border: `1px solid ${expanded ? color + '30' : 'var(--color-border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                          <button
                            onClick={() => setExpandedInsight(expanded ? null : i)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-bg-base)', cursor: 'pointer', border: 'none', textAlign: 'left' }}
                          >
                            <SentimentDot sentiment={insight.sentiment} />
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{insight.title}</span>
                            {expanded ? <ChevronUp size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                          </button>
                          {expanded && (
                            <div style={{ padding: '0 14px 14px', background: 'var(--color-bg-base)' }}>
                              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 10px' }}>{insight.body}</p>
                              <div style={{ fontSize: 11, color, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 5, padding: '4px 8px', display: 'inline-block' }}>
                                Key driver: {insight.driver}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Recommended Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {report.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'rgba(0,229,160,0.05)', borderRadius: 7, border: '1px solid rgba(0,229,160,0.15)' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color-success)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{r}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Powered by badge */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <Sparkles size={11} style={{ color: 'var(--color-accent-light)' }} /> Powered by Claude (Anthropic) · Grounded in your actual model data · No hallucinated numbers
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Generate controls */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14 }}>Generate Report</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 5 }}>Date Range</div>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    style={{ width: '100%', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: 'var(--color-text-primary)', cursor: 'pointer' }}
                  >
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last quarter</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 5 }}>Audience</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['owner', 'investor', 'employee'].map(a => (
                      <button key={a} onClick={() => setAudience(a)} style={{ flex: 1, padding: '6px 4px', borderRadius: 6, border: `1px solid ${audience === a ? 'var(--color-accent)' : 'var(--color-border)'}`, background: audience === a ? 'var(--color-accent-dim)' : 'var(--color-bg-base)', color: audience === a ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontWeight: audience === a ? 600 : 400 }}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ width: '100%', padding: '10px', borderRadius: 8, background: generating ? 'var(--color-bg-base)' : 'var(--color-accent)', color: generating ? 'var(--color-text-muted)' : '#fff', border: 'none', cursor: generating ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {generating
                  ? <><div style={{ width: 12, height: 12, border: '2px solid #666', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={13} /> {report ? 'Regenerate Report' : 'Generate Report'}</>
                }
              </button>
              {report && !generating && (
                <button
                  onClick={() => exportToPDF(report)}
                  style={{ marginTop: 8, width: '100%', padding: '9px', borderRadius: 8, background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Download size={13} /> Export PDF
                </button>
              )}
            </div>

            {/* Model context note */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Data source</div>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                This report is generated from your trained AI model's actual results — including SHAP feature importance, predictions, and risk scores. Claude only uses numbers from your data.
              </p>
            </div>

            {/* Past reports placeholder */}
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Report History</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Reports are generated on-demand and can be exported as PDF. History persistence will be added in Phase 4 (database).
              </div>
              {report && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, background: 'var(--color-bg-base)', cursor: 'pointer' }} onClick={() => exportToPDF(report)}>
                  <FileText size={13} style={{ color: 'var(--color-accent-light)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI Business Brief</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{report.date_range} · {report.audience}</div>
                  </div>
                  <Download size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
