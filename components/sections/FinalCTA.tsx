'use client'

import { motion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT, delay },
  }),
}

export default function FinalCTA() {
  const avatars = [
    { letter: 'S', gradient: 'linear-gradient(135deg,#4F46FF,#00E5A0)' },
    { letter: 'J', gradient: 'linear-gradient(135deg,#FF6B6B,#FFC85C)' },
    { letter: 'R', gradient: 'linear-gradient(135deg,#6E67FF,#2E2A99)' },
    { letter: 'D', gradient: 'linear-gradient(135deg,#00E5A0,#4F46FF)' },
    { letter: 'A', gradient: 'linear-gradient(135deg,#FFC85C,#FF6B6B)' },
  ]

  return (
    <div
      id="final-cta"
      style={{
        padding: 0,
        maxWidth: '100%',
        borderTop: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 80% at 50% 50%, #2E2A99 0%, #0F0D40 40%, #0A0B0F 100%)',
        minHeight: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'ctaPulse 4s ease-in-out infinite alternate',
      }}
    >
      <div style={{ textAlign: 'center', padding: '80px 48px', maxWidth: 800 }}>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: 'var(--color-text-primary)',
            marginBottom: 20,
          }}
        >
          Your business runs on data.<br />Time to use it.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0.1}
          variants={fadeUp}
          style={{ fontSize: 17, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 36 }}
        >
          Start your free 14-day trial. No credit card required. Set up in under 5 minutes.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0.2}
          variants={fadeUp}
          style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}
        >
          <a
            href="#pricing"
            className="cta-primary-btn"
            style={{
              padding: '16px 36px',
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 100,
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              animation: 'glowPulse 2s ease-in-out infinite alternate',
            }}
          >
            Start Free Trial
          </a>
          <a
            href="#"
            className="cta-secondary-btn"
            style={{
              padding: '16px 36px',
              background: 'var(--color-glass-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 100,
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              backdropFilter: 'blur(20px)',
            }}
          >
            Talk to Sales
          </a>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0.3}
          variants={fadeUp}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-muted)' }}
        >
          <div style={{ display: 'flex' }}>
            {avatars.map((a, i) => (
              <div
                key={a.letter}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '2px solid var(--color-bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  marginLeft: i === 0 ? 0 : -8,
                  background: a.gradient,
                }}
              >
                {a.letter}
              </div>
            ))}
          </div>
          <span style={{ color: 'var(--color-warning)', fontSize: 12, letterSpacing: 1 }}>★★★★★</span>
          <span>Join 47,000+ businesses already using FlowDesk</span>
        </motion.div>
      </div>
    </div>
  )
}
