import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif',
      padding: '0 24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{
          fontSize: 80, fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg,#4F46FF,#00E5A0)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8, lineHeight: 1,
        }}>
          404
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 40 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#4F46FF,#00E5A0)',
              color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            style={{
              padding: '12px 28px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 500, fontSize: 14, textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
