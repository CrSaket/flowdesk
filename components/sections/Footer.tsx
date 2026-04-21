'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const productLinks = ['Features', 'Pricing', 'Changelog', 'Integrations', 'API Docs']
const companyLinks = ['About', 'Blog', 'Careers', 'Press', 'Contact']
const socials = [
  { label: 'Twitter/X', icon: '𝕏' },
  { label: 'LinkedIn', icon: 'in' },
  { label: 'GitHub', icon: '⌥' },
  { label: 'YouTube', icon: '▶' },
]

const colVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.07 },
  }),
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = () => {
    if (email.includes('@')) setSubmitted(true)
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        padding: '80px 48px 48px',
      }}
    >
      <div
        className="footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '25% 20% 20% 35%',
          gap: 40,
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        {/* Brand */}
        <motion.div
          custom={0}
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 22,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', boxShadow: '0 0 10px var(--color-accent)' }} />
            FlowDesk
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {socials.map(s => (
              <motion.a
                key={s.label}
                href="#"
                aria-label={s.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Product Links */}
        <motion.div
          custom={1}
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 20 }}>Product</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {productLinks.map(link => (
              <li key={link}>
                <a
                  href="#"
                  className="footer-link"
                  style={{ fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Company Links */}
        <motion.div
          custom={2}
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 20 }}>Company</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companyLinks.map(link => (
              <li key={link}>
                <a
                  href="#"
                  className="footer-link"
                  style={{ fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          custom={3}
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Get weekly business intelligence tips.
          </div>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', gap: 8, marginBottom: 16 }}
              >
                <input
                  type="email"
                  id="newsletter-email"
                  aria-label="Email address for newsletter"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
                <motion.button
                  onClick={handleSubscribe}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Subscribe
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 14, color: 'var(--color-success)', padding: '10px 0' }}
              >
                ✓ You&apos;re in! Check your inbox.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.28 }}
        style={{
          maxWidth: 1280,
          margin: '48px auto 0',
          paddingTop: 24,
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>© 2026 FlowDesk, Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(link => (
            <a
              key={link}
              href="#"
              className="footer-legal-link"
              style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
            >
              {link}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.footer>
  )
}
