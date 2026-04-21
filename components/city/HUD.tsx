'use client'

import { useState, useEffect, useRef } from 'react'

const DISTRICTS = [
  { name: 'SKYLINE PANORAMA',    zone: '01 / 05', stat: '$2.4B+ daily volume' },
  { name: 'FINANCIAL DISTRICT',  zone: '02 / 05', stat: '47,000+ businesses' },
  { name: 'DATA TOWER',          zone: '03 / 05', stat: 'Live intelligence' },
  { name: 'BRIDGE DISTRICT',     zone: '04 / 05', stat: '200+ integrations' },
  { name: 'ROOFTOP OBSERVATORY', zone: '05 / 05', stat: 'Setup in 5 minutes' },
]

interface HUDProps {
  scrollRef: { current: number }
}

export default function HUD({ scrollRef }: HUDProps) {
  const [districtIdx, setDistrictIdx] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [fillPct, setFillPct] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const rafRef = useRef<number>()
  const prevIdx = useRef(-1)

  useEffect(() => {
    const tick = () => {
      const p = scrollRef.current
      const idx = Math.min(Math.floor(p * 5), 4)

      // Detect district boundary — fade out then in
      const zoneFrac = (p * 5) - idx
      const isBoundary = zoneFrac < 0.06 || zoneFrac > 0.94
      setOpacity(isBoundary ? 0 : 1)

      setFillPct(p)

      if (idx !== prevIdx.current) {
        prevIdx.current = idx
        setDistrictIdx(idx)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [scrollRef])

  // Typewriter on district change
  useEffect(() => {
    const name = DISTRICTS[districtIdx].name
    let i = 0
    setDisplayName('')
    const interval = setInterval(() => {
      i++
      setDisplayName(name.slice(0, i))
      if (i >= name.length) clearInterval(interval)
    }, 38)
    return () => clearInterval(interval)
  }, [districtIdx])

  const district = DISTRICTS[districtIdx]
  const fillHeight = Math.round(fillPct * 80)

  const hudStyle: React.CSSProperties = {
    opacity,
    transition: 'opacity 0.2s ease-out',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-accent-light)',
    fontSize: 11,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Top-left: district label */}
        <div style={hudStyle}>
          <div style={{ opacity: 0.5, fontSize: 9, marginBottom: 4 }}>DISTRICT</div>
          <div style={{ color: 'var(--color-accent-light)', minWidth: 220, minHeight: 14 }}>
            {displayName}
            <span style={{ opacity: Math.sin(Date.now() / 400) > 0 ? 1 : 0, marginLeft: 1 }}>_</span>
          </div>
        </div>

        {/* Top-right: progress bar */}
        <div style={{ ...hudStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 2, height: 80, background: 'rgba(79,70,255,0.2)', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: fillHeight,
              background: 'var(--color-accent)',
              transition: 'height 0.1s linear',
              boxShadow: '0 0 8px rgba(79,70,255,0.8)',
            }} />
          </div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>{district.zone}</div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {/* Bottom-left: contextual stat */}
        <div style={{ ...hudStyle, opacity: 0.7 }}>
          <div style={{ opacity: 0.5, fontSize: 9, marginBottom: 4 }}>LIVE DATA</div>
          <div>{district.stat}</div>
        </div>

        {/* Bottom-right: compass */}
        <div style={{ ...hudStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <CompassIcon progress={fillPct} />
          <div style={{ fontSize: 9, opacity: 0.5 }}>NAV</div>
        </div>
      </div>
    </div>
  )
}

function CompassIcon({ progress }: { progress: number }) {
  const rotation = progress * 30 - 15 // ±15° from centre
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s linear' }}
    >
      <circle cx={12} cy={12} r={10} stroke="rgba(79,70,255,0.3)" strokeWidth={1} />
      <polygon points="12,4 10,12 12,11 14,12" fill="rgba(79,70,255,0.9)" />
      <polygon points="12,20 10,12 12,13 14,12" fill="rgba(110,103,255,0.4)" />
      <circle cx={12} cy={12} r={1.5} fill="var(--color-accent)" />
    </svg>
  )
}
