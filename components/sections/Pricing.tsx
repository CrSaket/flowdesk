'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const plans = [
  {
    tier: 'Starter',
    monthly: 29,
    annual: 23,
    period: '/ month · up to 2 users',
    desc: 'Perfect for freelancers and solopreneurs getting started.',
    features: ['Unified financial dashboard', 'Basic cash flow tracking', 'Invoice generation (50/mo)', 'Monthly financial reports', 'Email support'],
    cta: 'Get Started',
    ctaStyle: 'secondary',
    highlighted: false,
  },
  {
    tier: 'Growth',
    monthly: 79,
    annual: 63,
    period: '/ month · up to 10 users',
    desc: 'For small teams ready to scale with full AI capabilities.',
    features: ['Everything in Starter, plus:', 'AI Cash Flow Forecasting (14-day)', 'Unlimited invoices + auto-chase', 'Operations Center', 'AI Business Advisor', 'Priority support'],
    cta: 'Start Free Trial',
    ctaStyle: 'primary',
    highlighted: true,
    badge: '✦ Most Popular',
  },
  {
    tier: 'Scale',
    monthly: 199,
    annual: 159,
    period: '/ month · up to 50 users',
    desc: 'For growing SMBs that need power, compliance, and white-glove support.',
    features: ['Everything in Growth, plus:', 'Tax & Compliance Tracker', 'Custom integrations + API', 'Dedicated account manager', 'SSO + audit logs', 'SLA-backed uptime'],
    cta: 'Get Started',
    ctaStyle: 'secondary',
    highlighted: false,
  },
]

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80)
      })
    }, { threshold: 0.15 })
    grid.querySelectorAll('.pricing-card').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" style={{ padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 16 }}>Pricing</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
          Simple pricing.<br />Serious results.
        </h2>
      </motion.div>

      {/* Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 56px' }}>
        <span style={{ fontSize: 14, color: !isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: !isAnnual ? 600 : 400 }}>Monthly</span>
        <div
          className={`toggle-switch${isAnnual ? ' on' : ''}`}
          role="switch"
          aria-checked={isAnnual}
          tabIndex={0}
          onClick={() => setIsAnnual(v => !v)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setIsAnnual(v => !v))}
        >
          <div className="toggle-knob" />
        </div>
        <span style={{ fontSize: 14, color: isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: isAnnual ? 600 : 400 }}>Annual</span>
        <AnimatePresence>
          {isAnnual && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              style={{ fontSize: 10, background: 'rgba(0,229,160,0.15)', color: 'var(--color-success)', padding: '3px 8px', borderRadius: 100, fontWeight: 600, display: 'inline-block' }}
            >
              Save 20%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div ref={gridRef} className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {plans.map(plan => (
          <div key={plan.tier} className={`pricing-card${plan.highlighted ? ' highlighted' : ''}`}>
            {plan.badge && (
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12, fontWeight: 500 }}>{plan.tier}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4, overflow: 'hidden' }}>
              <span style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>$</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={isAnnual ? plan.annual : plan.monthly}
                  initial={{ y: isAnnual ? -28 : 28, opacity: 0, filter: 'blur(6px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: isAnnual ? 28 : -28, opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: 'var(--color-text-primary)', lineHeight: 1, display: 'inline-block' }}
                >
                  {isAnnual ? plan.annual : plan.monthly}
                </motion.span>
              </AnimatePresence>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>{plan.period}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: 20 }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-accent-light)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={plan.ctaStyle === 'primary' ? 'pricing-btn-primary' : 'pricing-btn-secondary'}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 10,
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                border: plan.ctaStyle === 'secondary' ? '1px solid var(--color-border)' : 'none',
                background: plan.ctaStyle === 'primary' ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                color: plan.ctaStyle === 'primary' ? '#fff' : 'var(--color-text-primary)',
              }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
