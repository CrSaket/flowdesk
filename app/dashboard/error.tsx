'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
      }}>
        <AlertTriangle size={24} color="#FF6B6B" />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, margin: '0 0 8px' }}>
        Page failed to load
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 380, margin: '0 0 12px' }}>
        {error.message || 'An unexpected error occurred on this page.'}
      </p>
      {error.digest && (
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.5, margin: '0 0 32px' }}>
          Error ID: {error.digest}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--color-accent)', border: 'none',
            color: '#fff', fontSize: 14, fontWeight: 600,
          }}
        >
          <RefreshCw size={14} /> Try again
        </button>
        <a
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <Home size={14} /> Back to Overview
        </a>
      </div>
    </div>
  )
}
