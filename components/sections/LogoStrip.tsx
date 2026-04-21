'use client'

const logos = ['Retail Co.', 'Agency Group', 'Construction LLC', 'Bright & Co.', 'FoodGroup Ltd.', 'NovaBuild', 'PeakMetrics', 'Vertix Labs', 'OakField Co.']

export default function LogoStrip() {
  const doubled = [...logos, ...logos]

  return (
    <div
      className="logo-strip"
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        height: 80,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', padding: '0 48px', flexShrink: 0 }}>
        Trusted by teams at
      </span>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(90deg, var(--color-bg-surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(-90deg, var(--color-bg-surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div className="logo-marquee">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="logo-marquee-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', opacity: 0.45, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'opacity 0.2s', flexShrink: 0 }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
