'use client'

import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Waves } from '@/components/ui/wave-background'

const chartHeights = [34, 72, 48, 91, 63, 100, 56]

const activityRows = [
  { label: 'Cash runway', value: '4.8 mo', tone: 'var(--color-success)' },
  { label: 'Invoices due', value: '7 open', tone: 'var(--color-warning)' },
  { label: 'Team capacity', value: '82%', tone: 'var(--color-accent-light)' },
]

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  }),
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.93 },
  show: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT, delay },
  }),
}

export default function Hero() {
  const mockupControls = useAnimation()
  const prefersReducedMotion = useReducedMotion()

  // Entrance animation
  useEffect(() => {
    mockupControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, ease: EASE_OUT, delay: 0.18 },
    })
  }, [mockupControls])

  // Float loop — starts after entrance completes (0.18s delay + 0.85s duration)
  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      mockupControls.start({
        y: [0, -10, 0],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      })
    }, 1100)
    return () => clearTimeout(timer)
  }, [mockupControls, prefersReducedMotion])

  return (
    <section
      id="hero"
      className="hero-shell"
      style={{
        position: 'relative',
        overflow: 'visible',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '156px 16px 104px 0',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '100vw',
          transform: 'translateX(-50%)',
          zIndex: 0,
          opacity: 0.24,
          pointerEvents: 'none',
        }}
      >
        <Waves
          className="h-full w-full"
          strokeColor="rgba(79,70,255,0.32)"
          backgroundColor="transparent"
          pointerSize={0}
          strokeWidth={2.6}
        />
      </div>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '8% 0 auto auto',
          width: 520,
          height: 520,
          borderRadius: '50%',
          zIndex: 1,
          background:
            'radial-gradient(circle, rgba(79,70,255,0.26) 0%, rgba(79,70,255,0.08) 42%, rgba(10,11,15,0) 72%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 48,
          left: -96,
          width: 320,
          height: 320,
          borderRadius: '50%',
          zIndex: 1,
          background:
            'radial-gradient(circle, rgba(79,70,255,0.24) 0%, rgba(79,70,255,0.08) 42%, rgba(10,11,15,0) 76%)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -72,
          bottom: 36,
          width: 260,
          height: 260,
          borderRadius: '50%',
          zIndex: 1,
          background:
            'radial-gradient(circle, rgba(110,103,255,0.22) 0%, rgba(79,70,255,0.06) 44%, rgba(10,11,15,0) 76%)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="hero-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(500px, 1.18fr) minmax(340px, 0.74fr)',
          gap: 28,
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ── Text side ── */}
        <div className="hero-text" style={{ width: '100%', maxWidth: 760, paddingRight: 28 }}>
          <h1
            className="hero-headline"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(2.85rem, 6vw, 5rem)',
              lineHeight: 0.96,
              letterSpacing: '-0.05em',
              color: 'var(--color-text-primary)',
              marginTop: 0,
              textShadow:
                '0 0 24px rgba(79,70,255,0.2), 0 0 58px rgba(79,70,255,0.12)',
            }}
          >
            <motion.span
              className="line"
              style={{ display: 'block' }}
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
            >
              <span>Know your</span>
            </motion.span>
            <motion.span
              className="line"
              style={{ display: 'block' }}
              initial="hidden"
              animate="show"
              custom={0.11}
              variants={fadeUp}
            >
              <span style={{ color: 'var(--color-accent-light)' }}>
                Business Operations
              </span>
            </motion.span>
          </h1>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={0.24}
            variants={fadeUp}
            style={{
              marginTop: 28,
              fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: 500,
            }}
          >
            Real-time cash flow, runway forecasting, and operations — explained in plain English. No spreadsheets. No data team. Set up in under 5 minutes.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0.36}
            variants={fadeUp}
            style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <a
              href="#pricing"
              className="gradient-button"
              style={{
                padding: '14px 28px',
                borderRadius: 100,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Start Free Trial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#features"
              className="hero-secondary-btn"
              style={{
                padding: '14px 28px',
                borderRadius: 100,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                transition: 'color 0.2s, border-color 0.2s, background 0.2s',
              }}
            >
              See how it works
            </a>
          </motion.div>

          {/* Trust signal */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0.46}
            variants={fadeUp}
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            <span className="ticker-dot" style={{ width: 6, height: 6, flexShrink: 0 }} />
            No credit card required &middot; 14-day free trial &middot; Cancel anytime
          </motion.div>
        </div>

        {/* ── Mockup side ── */}
        <motion.div
          className="hero-mockup"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={mockupControls}
          style={{
            position: 'relative',
            minHeight: 560,
            width: '100%',
            maxWidth: 480,
            justifySelf: 'end',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              border: '1px solid var(--color-border)',
              background:
                'linear-gradient(180deg, rgba(22,24,32,0.94) 0%, rgba(15,17,23,0.96) 100%)',
              boxShadow:
                '0 36px 100px rgba(0,0,0,0.5), 0 0 60px rgba(79,70,255,0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '0 18px',
                borderBottom: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
              <span
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                flowdesk.app
              </span>
            </div>

            <div style={{ padding: 24 }}>
              {/* Stat cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                {[
                  { label: 'Revenue', value: '$84.2K', delta: '+24%' },
                  { label: 'Burn Rate', value: '$18.6K', delta: '-6%' },
                  { label: 'Runway', value: '4.8 mo', delta: '+0.7' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial="hidden"
                    animate="show"
                    custom={0.38 + i * 0.07}
                    variants={fadeUp}
                    style={{
                      borderRadius: 14,
                      padding: 16,
                      background: 'var(--color-bg-overlay)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        marginBottom: 8,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 20,
                        color: 'var(--color-text-primary)',
                        marginBottom: 6,
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-success)' }}>
                      {item.delta}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <motion.div
                initial="hidden"
                animate="show"
                custom={0.52}
                variants={fadeUp}
                style={{
                  marginTop: 18,
                  padding: 18,
                  borderRadius: 18,
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 700 }}>
                      Weekly cash movement
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Updated from live invoices and expense feeds
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-success)',
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: 'rgba(0,229,160,0.08)',
                    }}
                  >
                    Healthy trend
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
                  {chartHeights.map((height, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        gap: 10,
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          height: `${height}%`,
                        }}
                      >
                        <motion.div
                          className="chart-bar"
                          initial={{ scaleY: 0, transformOrigin: 'bottom' }}
                          animate={{ scaleY: 1, transformOrigin: 'bottom' }}
                          transition={{
                            duration: 0.55,
                            ease: EASE_OUT,
                            delay: 0.62 + index * 0.055,
                          }}
                          style={{ height: '100%', transformOrigin: 'bottom' }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--color-text-muted)',
                          textAlign: 'center',
                        }}
                      >
                        W{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Activity rows */}
              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gap: 10,
                }}
              >
                {activityRows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial="hidden"
                    animate="show"
                    custom={0.72 + i * 0.06}
                    variants={fadeUp}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: row.tone,
                      }}
                    >
                      {row.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Callout badges */}
          {[
            { label: 'Shortfall risk cleared', style: { top: 78, right: 18 }, delay: 0.72 },
            { label: 'Invoices synced in real time', style: { bottom: 138, left: 18 }, delay: 0.82 },
            { label: 'Forecast refreshed 2m ago', style: { bottom: 54, right: 22 }, delay: 0.92 },
          ].map(({ label, style, delay }) => (
            <motion.div
              key={label}
              className="callout"
              style={style}
              initial="hidden"
              animate="show"
              custom={delay}
              variants={scaleUp}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
