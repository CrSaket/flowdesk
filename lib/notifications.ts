/**
 * FlowDesk Notification Engine
 *
 * Generates smart notifications from:
 *  1. Model data (churn alerts, revenue forecasts, SHAP signals)
 *  2. Weekly report digests (every 7 days, keyed in localStorage)
 *
 * Notifications are persisted in localStorage so they survive page reloads
 * and accumulate over time.
 */

import type { TrainResult } from '@/lib/api'

export type NotifSeverity = 'info' | 'warning' | 'urgent' | 'success'

export interface AppNotification {
  id: string
  title: string
  description: string
  timestamp: Date
  read: boolean
  severity: NotifSeverity
  href?: string
  emailable?: boolean   // whether an email should be offered / auto-sent
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'fd_notifications'
const WEEKLY_KEY = 'fd_last_weekly_ts'
const EMAILED_KEY = 'fd_emailed_ids'

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
  } catch {
    return []
  }
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs))
  } catch {}
}

export function markEmailedId(id: string): void {
  try {
    const raw = localStorage.getItem(EMAILED_KEY)
    const ids: string[] = raw ? JSON.parse(raw) : []
    if (!ids.includes(id)) {
      ids.push(id)
      localStorage.setItem(EMAILED_KEY, JSON.stringify(ids))
    }
  } catch {}
}

export function wasEmailed(id: string): boolean {
  try {
    const raw = localStorage.getItem(EMAILED_KEY)
    const ids: string[] = raw ? JSON.parse(raw) : []
    return ids.includes(id)
  } catch {
    return false
  }
}

// ── Notification preferences ─────────────────────────────────────────────────

export interface NotifPrefs {
  weeklyReport: boolean
  churnAlerts: boolean
  revenueForecasts: boolean
  modelHealth: boolean
  emailDigest: boolean
  inAppAlerts: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  weeklyReport: true,
  churnAlerts: true,
  revenueForecasts: true,
  modelHealth: false,
  emailDigest: true,
  inAppAlerts: true,
  pushNotifications: false,
  marketingEmails: false,
}

const NOTIF_PREFS_KEY = 'fd_notif_prefs'

export function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY)
    if (!raw) return DEFAULT_NOTIF_PREFS
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIF_PREFS
  }
}

export function saveNotifPrefs(prefs: NotifPrefs): void {
  try {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs))
  } catch {}
}

// ── AI preferences ────────────────────────────────────────────────────────────

export interface AIPrefs {
  shapExplanations: boolean
  limeExplanations: boolean
  fairnessChecks: boolean
  autoRetrain: boolean
  confidenceThreshold: number
  forecastHorizon: number
}

const DEFAULT_AI_PREFS: AIPrefs = {
  shapExplanations: true,
  limeExplanations: true,
  fairnessChecks: true,
  autoRetrain: false,
  confidenceThreshold: 70,
  forecastHorizon: 14,
}

const AI_PREFS_KEY = 'fd_ai_prefs'

export function loadAIPrefs(): AIPrefs {
  try {
    const raw = localStorage.getItem(AI_PREFS_KEY)
    if (!raw) return DEFAULT_AI_PREFS
    return { ...DEFAULT_AI_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_AI_PREFS
  }
}

export function saveAIPrefs(prefs: AIPrefs): void {
  try {
    localStorage.setItem(AI_PREFS_KEY, JSON.stringify(prefs))
  } catch {}
}

// ── Weekly report ─────────────────────────────────────────────────────────────

export function generateWeeklyNotification(): AppNotification | null {
  try {
    const lastTs = localStorage.getItem(WEEKLY_KEY)
    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    // On first load or after 7 days, emit a weekly report notif
    if (!lastTs || now - parseInt(lastTs, 10) > sevenDays) {
      localStorage.setItem(WEEKLY_KEY, String(now))
      const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now)
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        id: `weekly-${now}`,
        title: 'Weekly AI Report Ready',
        description: `Your performance report for ${fmt(weekStart)} – ${fmt(weekEnd)} is available. Review model accuracy trends, top prediction drivers, and business impact.`,
        timestamp: new Date(),
        read: false,
        severity: 'info',
        href: '/dashboard/reports',
        emailable: true,
      }
    }
  } catch {}
  return null
}

// ── Model-driven notifications ────────────────────────────────────────────────

function makeId(prefix: string, trainResult: TrainResult): string {
  return `${prefix}-${trainResult.model_id}`
}

export function generateModelNotifications(trainResult: TrainResult): AppNotification[] {
  const notifs: AppNotification[] = []
  const now = new Date()
  const isChurn = trainResult.goal === 'churn_risk'
  const isSales = trainResult.goal === 'sales_forecast'

  // ── Churn alerts ────────────────────────────────────────────────────────────
  if (isChurn) {
    const highRisk = trainResult.high_risk_count ?? 0
    if (highRisk >= 5) {
      notifs.push({
        id: makeId('churn-critical', trainResult),
        title: `${highRisk} Customers at Critical Churn Risk`,
        description: `Your AI model flagged ${highRisk} customers with >70% churn probability. Top driver: ${trainResult.shap_global?.[0]?.label ?? 'inactivity'}. Immediate outreach recommended to prevent revenue loss.`,
        timestamp: now,
        read: false,
        severity: 'urgent',
        href: '/dashboard/predictions',
        emailable: true,
      })
    } else if (highRisk > 0) {
      notifs.push({
        id: makeId('churn-warn', trainResult),
        title: `${highRisk} Customer${highRisk === 1 ? '' : 's'} at High Churn Risk`,
        description: `${highRisk} customer${highRisk === 1 ? '' : 's'} crossed the 70% churn threshold. Primary signal: ${trainResult.shap_global?.[0]?.label ?? 'engagement drop'}. Review their profiles now.`,
        timestamp: now,
        read: false,
        severity: 'warning',
        href: '/dashboard/predictions',
        emailable: true,
      })
    }

    // AUC signal
    if (trainResult.auc != null && trainResult.auc >= 0.9) {
      notifs.push({
        id: makeId('auc-excellent', trainResult),
        title: 'Excellent Model Discrimination (AUC 0.9+)',
        description: `Your churn model achieved AUC ${trainResult.auc.toFixed(3)} — top 10% performance. Predictions are highly reliable. Consider acting on even medium-risk (50–70%) customers.`,
        timestamp: now,
        read: false,
        severity: 'success',
        href: '/dashboard/health',
        emailable: false,
      })
    }
  }

  // ── Sales forecast alerts ────────────────────────────────────────────────────
  if (isSales) {
    const predicted = trainResult.forecast_series
      ?.filter(p => p.predicted != null)
      ?.reduce((a, p) => a + (p.predicted ?? 0), 0) ?? 0
    const actual = trainResult.forecast_series
      ?.filter(p => p.actual != null)
      ?.reduce((a, p) => a + (p.actual ?? 0), 0) ?? 0

    if (predicted > 0 && actual > 0) {
      const growthPct = ((predicted - actual) / actual) * 100
      if (growthPct >= 10) {
        notifs.push({
          id: makeId('rev-growth', trainResult),
          title: `AI Projects ${growthPct.toFixed(0)}% Revenue Growth`,
          description: `Your model forecasts $${predicted.toLocaleString(undefined, { maximumFractionDigits: 0 })} over the next 14 days — ${growthPct.toFixed(1)}% above recent actuals. Top growth driver: ${trainResult.shap_global?.[0]?.label ?? 'trend'}. Act to capitalize.`,
          timestamp: now,
          read: false,
          severity: 'success',
          href: '/dashboard/predictions',
          emailable: true,
        })
      } else if (growthPct <= -10) {
        notifs.push({
          id: makeId('rev-drop', trainResult),
          title: `AI Warns of ${Math.abs(growthPct).toFixed(0)}% Revenue Decline`,
          description: `Forecast shows $${predicted.toLocaleString(undefined, { maximumFractionDigits: 0 })} next 14 days — ${Math.abs(growthPct).toFixed(1)}% below recent actuals. Key risk factor: ${trainResult.shap_global?.[0]?.label ?? 'seasonal shift'}. Review and adjust strategy.`,
          timestamp: now,
          read: false,
          severity: 'warning',
          href: '/dashboard/predictions',
          emailable: true,
        })
      }
    }

    // Low R² warning
    if (trainResult.r2 != null && trainResult.r2 < 0.6) {
      notifs.push({
        id: makeId('r2-low', trainResult),
        title: 'Forecast Confidence is Low',
        description: `Model R² is ${trainResult.r2.toFixed(2)} — predictions may have high variance. Consider uploading more historical data or adding relevant features to improve accuracy.`,
        timestamp: now,
        read: false,
        severity: 'warning',
        href: '/dashboard/health',
        emailable: false,
      })
    }
  }

  // ── Shared signals ────────────────────────────────────────────────────────
  // Dominant SHAP feature
  const top = trainResult.shap_global?.[0]
  if (top && top.importance >= 45) {
    notifs.push({
      id: makeId('shap-dominant', trainResult),
      title: `Strong Signal: "${top.label}" Drives ${top.importance}% of Predictions`,
      description: `A single feature dominates your model. This is a business opportunity — small improvements to "${top.label}" could have outsized impact. Visit Explainability for the full SHAP breakdown.`,
      timestamp: now,
      read: false,
      severity: 'info',
      href: '/dashboard/explainability',
      emailable: false,
    })
  }

  // High accuracy milestone
  if (trainResult.accuracy >= 92) {
    notifs.push({
      id: makeId('accuracy-high', trainResult),
      title: `Model Accuracy: ${trainResult.accuracy}%`,
      description: `Your AI model hit ${trainResult.accuracy}% accuracy — well above the 85% production threshold. Trained on ${trainResult.training_rows.toLocaleString()} records. Predictions are highly trustworthy.`,
      timestamp: now,
      read: false,
      severity: 'success',
      href: '/dashboard/health',
      emailable: false,
    })
  }

  return notifs
}

// ── Merge without duplicates ──────────────────────────────────────────────────

export function mergeNotifications(
  existing: AppNotification[],
  incoming: AppNotification[]
): AppNotification[] {
  const existingIds = new Set(existing.map(n => n.id))
  const fresh = incoming.filter(n => !existingIds.has(n.id))
  // Prepend fresh notifications, keep most recent 50
  return [...fresh, ...existing].slice(0, 50)
}
