'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Topbar */}
      <header style={{
        height: 60,
        flexShrink: 0,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'var(--color-bg-base)',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 10px rgba(79,70,255,0.8)',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}>
            FlowDesk
          </span>
        </Link>

        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '7px 14px',
            transition: 'color 0.15s, border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-text-primary)'
            e.currentTarget.style.borderColor = 'rgba(79,70,255,0.3)'
            e.currentTarget.style.background = 'var(--color-bg-overlay)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.background = 'var(--color-bg-elevated)'
          }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </header>

      {/* Page content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '48px 64px',
      }}>
        {children}
      </main>
    </div>
  )
}
