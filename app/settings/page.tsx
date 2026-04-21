'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import {
  User, Bell, Shield, Palette, Database, CreditCard,
  Trash2, Download, LogOut, CheckCircle, Zap,
  ExternalLink, AlertCircle,
} from 'lucide-react'
import CinematicSwitch from '@/components/ui/cinematic-glow-toggle'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type NotifPrefs, type AIPrefs,
  loadNotifPrefs, saveNotifPrefs,
  loadAIPrefs, saveAIPrefs,
} from '@/lib/notifications'

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} style={{ color: 'var(--color-accent-light)' }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px', ...style }}>
      {children}
    </div>
  )
}

function SettingRow({ label, description, children, last = false }: {
  label: string; description?: string; children: React.ReactNode; last?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: description ? 2 : 0 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SettingsInput({ value, onChange, placeholder, type = 'text', disabled = false, width = 220 }: {
  value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; width?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value} onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder} type={type} disabled={disabled}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width, background: 'var(--color-bg-base)',
        border: `1px solid ${focused ? 'rgba(79,70,255,0.55)' : 'var(--color-border)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(79,70,255,0.1)' : 'none',
        borderRadius: 7, padding: '7px 11px', fontSize: 13,
        color: 'var(--color-text-primary)', outline: 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  )
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function SaveButton({ onClick, state, errorMsg }: { onClick: () => void; state: SaveState; errorMsg?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
      <button
        onClick={onClick}
        disabled={state === 'saving'}
        style={{
          padding: '9px 20px',
          background: state === 'saved' ? 'rgba(0,229,160,0.12)' : state === 'error' ? 'rgba(255,107,107,0.1)' : 'var(--color-accent)',
          border: state === 'saved' ? '1px solid rgba(0,229,160,0.3)' : state === 'error' ? '1px solid rgba(255,107,107,0.3)' : 'none',
          borderRadius: 8,
          color: state === 'saved' ? '#00E5A0' : state === 'error' ? '#FF6B6B' : '#fff',
          fontSize: 13, fontWeight: 700, cursor: state === 'saving' ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
        }}
      >
        {state === 'saving'
          ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Saving…</>
          : state === 'saved'
          ? <><CheckCircle size={14} /> Saved!</>
          : state === 'error'
          ? <><AlertCircle size={14} /> Failed</>
          : 'Save Changes'}
      </button>
      {state === 'error' && errorMsg && (
        <span style={{ fontSize: 11, color: '#FF6B6B' }}>{errorMsg}</span>
      )}
    </div>
  )
}

function DangerButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{ padding: '8px 16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 7, color: '#FF6B6B', fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,107,107,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.08)' }}
    >
      {children}
    </button>
  )
}

// ── Plan data ─────────────────────────────────────────────────────────────────

const PLANS = [
  { id: 'starter',    name: 'Starter',    price: '$0',     features: ['1 active model', '1,000 predictions/mo', 'Basic SHAP insights', 'Email support'] },
  { id: 'growth',     name: 'Growth',     price: '$49',    features: ['5 active models', '25,000 predictions/mo', 'Full SHAP + LIME + Fairness', 'Weekly AI reports', 'Priority support'], popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited models', 'Unlimited predictions', 'Custom integrations', 'SSO & audit logs', 'Dedicated CSM'] },
]

// ── Profile ───────────────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: any }) {
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName]   = useState(user?.lastName  ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errMsg, setErrMsg]       = useState('')

  const displayName = user?.fullName ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const save = async () => {
    if (saveState === 'saving') return
    setSaveState('saving')
    setErrMsg('')
    try {
      await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() || undefined })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch (e: any) {
      setErrMsg(e?.errors?.[0]?.message ?? e?.message ?? 'Update failed')
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3500)
    }
  }

  return (
    <section>
      <SectionHeader icon={User} title="Profile" description="Your account identity and personal details." />
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
          {user?.imageUrl
            ? <img src={user.imageUrl} alt={displayName} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46FF,#00E5A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
          }
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user?.primaryEmailAddress?.emailAddress}</div>
            <div style={{ fontSize: 11, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(79,70,255,0.1)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 4, color: 'var(--color-accent-light)' }}>
              <Zap size={9} /> {(user?.publicMetadata?.plan as string) ?? 'Growth Plan'}
            </div>
          </div>
        </div>

        <SettingRow label="First Name" description="Used in greetings and reports">
          <SettingsInput value={firstName} onChange={setFirstName} placeholder="First name" />
        </SettingRow>
        <SettingRow label="Last Name" description="Displayed in your profile">
          <SettingsInput value={lastName} onChange={setLastName} placeholder="Last name" />
        </SettingRow>
        <SettingRow label="Email Address" description="Managed by your sign-in provider" last>
          <SettingsInput value={user?.primaryEmailAddress?.emailAddress ?? ''} disabled />
        </SettingRow>
        <SaveButton onClick={save} state={saveState} errorMsg={errMsg} />
      </Card>
    </section>
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs]       = useState<NotifPrefs | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => { setPrefs(loadNotifPrefs()) }, [])

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs(p => p ? { ...p, [key]: !p[key] } : p)

  const save = () => {
    if (!prefs) return
    saveNotifPrefs(prefs)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2500)
  }

  const rows: { key: keyof NotifPrefs; label: string; description: string }[] = [
    { key: 'weeklyReport',      label: 'Weekly AI Reports',        description: 'Performance digest delivered every 7 days' },
    { key: 'churnAlerts',       label: 'Churn Risk Alerts',        description: 'Immediate alerts when customers hit high-risk threshold' },
    { key: 'revenueForecasts',  label: 'Revenue Forecast Alerts',  description: 'Notify when AI detects significant revenue changes' },
    { key: 'modelHealth',       label: 'Model Health Warnings',    description: 'Alerts for accuracy drops or data drift' },
    { key: 'emailDigest',       label: 'Email Delivery',           description: 'Send actionable alerts to your email address' },
    { key: 'inAppAlerts',       label: 'In-App Notifications',     description: 'Show alerts in the notification bell' },
    { key: 'pushNotifications', label: 'Push Notifications',       description: 'Browser push notifications (coming soon)' },
    { key: 'marketingEmails',   label: 'Product Updates',          description: 'FlowDesk tips, new features, and announcements' },
  ]

  if (!prefs) return null

  return (
    <section>
      <SectionHeader icon={Bell} title="Notifications" description="Control which alerts you receive and how they're delivered." />
      <Card>
        {rows.map((row, i) => (
          <SettingRow key={row.key} label={row.label} description={row.description} last={i === rows.length - 1}>
            <CinematicSwitch
              checked={prefs[row.key]}
              onChange={() => toggle(row.key)}
              disabled={row.key === 'pushNotifications'}
            />
          </SettingRow>
        ))}
        <SaveButton onClick={save} state={saveState} />
      </Card>
    </section>
  )
}

// ── AI Preferences ────────────────────────────────────────────────────────────

function AIPreferencesSection() {
  const [prefs, setPrefs]       = useState<AIPrefs | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [thresholdStr, setThresholdStr] = useState('')
  const [horizonStr, setHorizonStr]     = useState('')

  useEffect(() => {
    const p = loadAIPrefs()
    setPrefs(p)
    setThresholdStr(String(p.confidenceThreshold))
    setHorizonStr(String(p.forecastHorizon))
  }, [])

  const toggleBool = (key: 'shapExplanations' | 'limeExplanations' | 'fairnessChecks' | 'autoRetrain') =>
    setPrefs(p => p ? { ...p, [key]: !p[key] } : p)

  const save = () => {
    if (!prefs) return
    const threshold = Math.min(100, Math.max(1, parseInt(thresholdStr) || 70))
    const horizon   = Math.min(365, Math.max(1, parseInt(horizonStr) || 14))
    const next = { ...prefs, confidenceThreshold: threshold, forecastHorizon: horizon }
    saveAIPrefs(next)
    setPrefs(next)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2500)
  }

  if (!prefs) return null

  return (
    <section>
      <SectionHeader icon={Zap} title="AI & Model Preferences" description="Customize how FlowDesk's AI engine behaves." />
      <Card>
        <SettingRow label="SHAP Explainability" description="Compute feature importance for every prediction">
          <CinematicSwitch checked={prefs.shapExplanations} onChange={() => toggleBool('shapExplanations')} />
        </SettingRow>
        <SettingRow label="LIME Explanations" description="Local interpretable model-agnostic explanations">
          <CinematicSwitch checked={prefs.limeExplanations} onChange={() => toggleBool('limeExplanations')} />
        </SettingRow>
        <SettingRow label="Fairness Analysis" description="Automatically audit predictions for demographic bias">
          <CinematicSwitch checked={prefs.fairnessChecks} onChange={() => toggleBool('fairnessChecks')} />
        </SettingRow>
        <SettingRow label="Auto-Retrain on Upload" description="Re-train model automatically when new data is uploaded">
          <CinematicSwitch checked={prefs.autoRetrain} onChange={() => toggleBool('autoRetrain')} />
        </SettingRow>
        <SettingRow label="Churn Alert Threshold" description="Minimum probability % to trigger a churn alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingsInput value={thresholdStr} onChange={setThresholdStr} width={80} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>%</span>
          </div>
        </SettingRow>
        <SettingRow label="Forecast Horizon" description="Number of days to predict into the future" last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingsInput value={horizonStr} onChange={setHorizonStr} width={80} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>days</span>
          </div>
        </SettingRow>
        <SaveButton onClick={save} state={saveState} />
      </Card>
    </section>
  )
}

// ── Appearance ────────────────────────────────────────────────────────────────

const APPEARANCE_KEY = 'fd_appearance'

function AppearanceSection() {
  const [theme,   setThemeState]   = useState<'dark' | 'system'>('dark')
  const [density, setDensityState] = useState<'comfortable' | 'compact'>('comfortable')
  const [saveState, setSaveState]  = useState<SaveState>('idle')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPEARANCE_KEY)
      if (raw) {
        const { theme: t, density: d } = JSON.parse(raw)
        if (t) setThemeState(t)
        if (d) setDensityState(d)
      }
    } catch {}
  }, [])

  const save = () => {
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ theme, density }))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', background: active ? 'var(--color-accent)' : 'var(--color-bg-base)', color: active ? '#fff' : 'var(--color-text-muted)', border: active ? 'none' : '1px solid var(--color-border)' }}>
      {label}
    </button>
  )

  return (
    <section>
      <SectionHeader icon={Palette} title="Appearance" description="Customize how the dashboard looks and feels." />
      <Card>
        <SettingRow label="Color Theme" description="FlowDesk is built and optimized for dark environments">
          <div style={{ display: 'flex', gap: 6 }}>
            <Chip label="Dark"   active={theme === 'dark'}   onClick={() => setThemeState('dark')} />
            <Chip label="System" active={theme === 'system'} onClick={() => setThemeState('system')} />
          </div>
        </SettingRow>
        <SettingRow label="Layout Density" description="How much information is shown per screen" last>
          <div style={{ display: 'flex', gap: 6 }}>
            <Chip label="Comfortable" active={density === 'comfortable'} onClick={() => setDensityState('comfortable')} />
            <Chip label="Compact"     active={density === 'compact'}     onClick={() => setDensityState('compact')} />
          </div>
        </SettingRow>
        <SaveButton onClick={save} state={saveState} />
      </Card>
    </section>
  )
}

// ── Security ──────────────────────────────────────────────────────────────────

const SECURITY_PREFS_KEY = 'fd_security_prefs'

function SecuritySection({ user }: { user: any }) {
  const [sessionAlerts, setSessionAlerts] = useState(true)
  const [saveState, setSaveState]         = useState<SaveState>('idle')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SECURITY_PREFS_KEY)
      if (raw) { const { sessionAlerts: s } = JSON.parse(raw); if (s !== undefined) setSessionAlerts(s) }
    } catch {}
  }, [])

  const save = () => {
    try {
      localStorage.setItem(SECURITY_PREFS_KEY, JSON.stringify({ sessionAlerts }))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch { setSaveState('error'); setTimeout(() => setSaveState('idle'), 3000) }
  }

  // Clerk-hosted 2FA management URL
  const clerkAccountUrl = 'https://accounts.clerk.dev/user'

  return (
    <section>
      <SectionHeader icon={Shield} title="Security" description="Manage access controls and account security." />
      <Card style={{ marginBottom: 16 }}>
        {/* 2FA — link out to Clerk's management UI, the only way to do this with Clerk v7 */}
        <SettingRow label="Two-Factor Authentication" description="Manage 2FA via your account security settings">
          <a
            href={clerkAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--color-accent-light)', background: 'rgba(79,70,255,0.1)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 7, padding: '6px 12px', textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.1)')}
          >
            Manage <ExternalLink size={11} />
          </a>
        </SettingRow>
        <SettingRow label="New Login Alerts" description="Persist a preference for session notifications" last>
          <CinematicSwitch checked={sessionAlerts} onChange={setSessionAlerts} />
        </SettingRow>
        <SaveButton onClick={save} state={saveState} />
      </Card>

      {/* Active sessions info */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Active Sessions</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          To view and revoke active sessions across all your devices, manage them in your account portal.
        </div>
        <a
          href={clerkAccountUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 7, padding: '7px 14px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,70,255,0.35)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
        >
          View sessions <ExternalLink size={11} />
        </a>
      </Card>
    </section>
  )
}

// ── Data & Privacy ────────────────────────────────────────────────────────────

function DataSection({ userEmail }: { userEmail: string | null }) {
  const [modelId,     setModelId]     = useState<string | null>(null)
  const [hasData,     setHasData]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [exported,    setExported]    = useState(false)
  const [cleared,     setCleared]     = useState(false)

  useEffect(() => {
    setModelId(localStorage.getItem('model_id'))
    setHasData(!!localStorage.getItem('train_result'))
  }, [cleared])

  const handleExport = () => {
    setExporting(true)
    try {
      const payload = {
        exported_at: new Date().toISOString(),
        user_email: userEmail,
        model_id: localStorage.getItem('model_id'),
        goal: localStorage.getItem('goal'),
        train_result: (() => { try { return JSON.parse(localStorage.getItem('train_result') ?? 'null') } catch { return null } })(),
        notification_prefs: (() => { try { return JSON.parse(localStorage.getItem('fd_notif_prefs') ?? 'null') } catch { return null } })(),
        ai_prefs: (() => { try { return JSON.parse(localStorage.getItem('fd_ai_prefs') ?? 'null') } catch { return null } })(),
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flowdesk-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } catch {}
    setExporting(false)
  }

  const handleClear = () => {
    localStorage.removeItem('model_id')
    localStorage.removeItem('goal')
    localStorage.removeItem('train_result')
    localStorage.removeItem('fd_last_weekly_ts')
    localStorage.removeItem('fd_notifications')
    localStorage.removeItem('fd_emailed_ids')
    setCleared(c => !c)  // trigger useEffect re-read
  }

  return (
    <section>
      <SectionHeader icon={Database} title="Data & Privacy" description="Manage your data, exports, and privacy settings." />
      <Card style={{ marginBottom: 16 }}>
        <SettingRow label="Active Model" description={modelId ? `ID: ${modelId.slice(0, 28)}…` : 'No model trained yet'}>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: modelId ? 'rgba(0,229,160,0.1)' : 'var(--color-bg-base)', color: modelId ? '#00E5A0' : 'var(--color-text-muted)', border: `1px solid ${modelId ? 'rgba(0,229,160,0.25)' : 'var(--color-border)'}`, fontWeight: 600 }}>
            {modelId ? 'Active' : 'None'}
          </span>
        </SettingRow>
        <SettingRow label="Training Data & Predictions" description="Model results, SHAP values, and forecasts" last>
          <span style={{ fontSize: 11, color: hasData ? '#00E5A0' : 'var(--color-text-muted)', fontWeight: 600 }}>
            {hasData ? 'Available' : 'No data yet'}
          </span>
        </SettingRow>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Export Your Data</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          Download a complete JSON export of your model results, predictions, SHAP values, and preferences.
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{ padding: '9px 18px', background: exported ? 'rgba(0,229,160,0.1)' : 'var(--color-bg-base)', border: `1px solid ${exported ? 'rgba(0,229,160,0.3)' : 'var(--color-border)'}`, borderRadius: 8, color: exported ? '#00E5A0' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: exporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
        >
          {exporting
            ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Preparing…</>
            : exported
            ? <><CheckCircle size={13} /> Downloaded!</>
            : <><Download size={13} /> Export all data</>
          }
        </button>
      </Card>
    </section>
  )
}

// ── Billing ───────────────────────────────────────────────────────────────────

function BillingSection() {
  const [currentPlan]   = useState('growth')
  const [modelsCount,   setModelsCount]   = useState(0)
  const [reportCount,   setReportCount]   = useState(0)
  const [predictions,   setPredictions]   = useState(0)

  useEffect(() => {
    // Derive real usage from localStorage
    const hasModel = !!localStorage.getItem('model_id')
    if (hasModel) setModelsCount(1)
    try {
      const tr = JSON.parse(localStorage.getItem('train_result') ?? 'null')
      if (tr) {
        setPredictions(tr.customers_scored ?? tr.training_rows ?? 0)
        setReportCount(tr.accuracy >= 70 ? 1 : 0)
      }
    } catch {}
  }, [])

  const usage = [
    { label: 'Models trained',          used: modelsCount, total: 5 },
    { label: 'Predictions generated',   used: predictions, total: 25000 },
    { label: 'AI reports generated',    used: reportCount, total: 20 },
  ]

  return (
    <section>
      <SectionHeader icon={CreditCard} title="Plan & Billing" description="Your current subscription and usage." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {PLANS.map(plan => {
          const isActive = plan.id === currentPlan
          return (
            <div key={plan.id} style={{ background: isActive ? 'rgba(79,70,255,0.06)' : 'var(--color-bg-elevated)', border: `1px solid ${isActive ? 'rgba(79,70,255,0.4)' : 'var(--color-border)'}`, borderRadius: 12, padding: '16px 18px', position: 'relative', transition: 'border-color 0.18s' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-accent)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-primary)', marginBottom: 10 }}>
                {plan.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)' }}>{plan.price !== 'Custom' ? '/mo' : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    <CheckCircle size={10} style={{ color: '#00E5A0', flexShrink: 0, marginTop: 2 }} /> {f}
                  </div>
                ))}
              </div>
              {isActive
                ? <div style={{ fontSize: 11, color: '#00E5A0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Current plan</div>
                : <button style={{ width: '100%', padding: '7px', background: 'var(--color-accent)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>{plan.id === 'enterprise' ? 'Contact us' : 'Upgrade'}</button>
              }
            </div>
          )
        })}
      </div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Usage this month</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Resets on May 1, 2026</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-accent-light)', background: 'rgba(79,70,255,0.1)', border: '1px solid rgba(79,70,255,0.2)', borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>Growth Plan</span>
        </div>
        {usage.map(item => (
          <div key={item.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{item.used.toLocaleString()} / {item.total.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((item.used / item.total) * 100, 100)}%`, background: item.used / item.total > 0.85 ? '#FFC85C' : 'var(--color-accent)', borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>
        ))}
      </Card>
    </section>
  )
}

// ── Danger Zone ───────────────────────────────────────────────────────────────

function DangerZoneSection({ user, signOut }: { user: any; signOut: any }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [clearing,      setClearing]      = useState(false)
  const [cleared,       setCleared]       = useState(false)

  const handleClear = () => {
    setClearing(true)
    localStorage.removeItem('model_id')
    localStorage.removeItem('goal')
    localStorage.removeItem('train_result')
    localStorage.removeItem('fd_last_weekly_ts')
    localStorage.removeItem('fd_notifications')
    localStorage.removeItem('fd_emailed_ids')
    setTimeout(() => { setClearing(false); setCleared(true); setTimeout(() => setCleared(false), 3000) }, 400)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await user?.delete()
      // Clerk will handle redirect after deletion
    } catch (e: any) {
      // If user.delete() isn't available (Clerk config), fall back to sign-out
      await signOut({ redirectUrl: '/' })
    }
  }

  return (
    <section>
      <SectionHeader icon={Trash2} title="Sign Out / Delete Account" description="Sign out from all devices or permanently delete your account." />
      <Card style={{ border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.03)' }}>
        <SettingRow label="Sign out everywhere" description="Terminate all active sessions on all devices">
          <DangerButton onClick={() => signOut({ redirectUrl: '/' })}>
            <LogOut size={12} /> Sign out all
          </DangerButton>
        </SettingRow>

        <SettingRow label="Clear all local data" description="Remove trained model, predictions, and notifications from this browser" last={!confirmDelete}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {cleared && <span style={{ fontSize: 11, color: '#00E5A0', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Cleared</span>}
            <DangerButton onClick={handleClear} disabled={clearing}>
              {clearing
                ? <><span style={{ width: 11, height: 11, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Clearing…</>
                : <><Trash2 size={12} /> Clear data</>
              }
            </DangerButton>
          </div>
        </SettingRow>

        {!confirmDelete && (
          <SettingRow label="Delete account" description="Permanently delete your FlowDesk account and all data" last>
            <DangerButton onClick={() => setConfirmDelete(true)}>
              <Trash2 size={12} /> Delete account
            </DangerButton>
          </SettingRow>
        )}

        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '14px 0 0', borderTop: '1px solid rgba(255,107,107,0.2)', marginTop: 4 }}>
                <div style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 600, marginBottom: 6 }}>Are you absolutely sure?</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  This will permanently delete your account, all models, predictions, and data. This cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <DangerButton onClick={handleDelete} disabled={deleting}>
                    {deleting
                      ? <><span style={{ width: 11, height: 11, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Deleting…</>
                      : <><Trash2 size={12} /> Yes, delete permanently</>
                    }
                  </DangerButton>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{ padding: '8px 14px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 7, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </section>
  )
}

// ── Side nav ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'profile',       label: 'Profile'                 },
  { id: 'notifications', label: 'Notifications'           },
  { id: 'ai',            label: 'AI Preferences'          },
  { id: 'appearance',    label: 'Appearance'              },
  { id: 'security',      label: 'Security'                },
  { id: 'data',          label: 'Data & Privacy'          },
  { id: 'billing',       label: 'Plan & Billing'          },
  { id: 'danger',        label: 'Sign Out/Delete Account' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [active, setActive] = useState('profile')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Scroll spy — update active nav item as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.sectionId
            if (id) setActive(id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 }
    )
    const refs = sectionRefs.current
    Object.values(refs).forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    setActive(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'dash-enter 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-text-primary)' }}>Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'start' }}>

        {/* Sticky side nav */}
        <div style={{ position: 'sticky', top: 0 }}>
          <nav style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_ITEMS.map((s) => {
              const isActive  = active === s.id
              const isDanger  = s.id === 'danger'
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: isDanger ? '12px 11px 9px' : '9px 11px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    textAlign: 'left', width: '100%', fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? (isDanger ? 'rgba(255,107,107,0.1)' : 'rgba(79,70,255,0.12)') : 'transparent',
                    color: isActive ? (isDanger ? '#FF6B6B' : 'var(--color-accent-light)') : isDanger ? 'rgba(255,107,107,0.6)' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                    marginTop: isDanger ? 8 : 0,
                    borderTop: isDanger ? '1px solid var(--color-border)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-overlay)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {s.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[
            { id: 'profile',       el: <ProfileSection user={user} /> },
            { id: 'notifications', el: <NotificationsSection /> },
            { id: 'ai',            el: <AIPreferencesSection /> },
            { id: 'appearance',    el: <AppearanceSection /> },
            { id: 'security',      el: <SecuritySection user={user} /> },
            { id: 'data',          el: <DataSection userEmail={userEmail} /> },
            { id: 'billing',       el: <BillingSection /> },
            { id: 'danger',        el: <DangerZoneSection user={user} signOut={signOut} /> },
          ].map(({ id, el }) => (
            <div key={id} ref={node => { sectionRefs.current[id] = node }} data-section-id={id} style={{ scrollMarginTop: 16 }}>
              {el}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
