'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
            An unexpected error occurred. This has been logged automatically.
            {error.digest && (
              <span style={{ display: 'block', marginTop: 8, fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#4F46FF,#00E5A0)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
