'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X as XIcon } from 'lucide-react'

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="announcement-banner"
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -36, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: '100%',
            height: 36,
            background: 'linear-gradient(90deg, #2E2A99, #1E1B6A, #0F1117)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 60,
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
          }}
        >
          <Zap size={13} style={{ color: 'var(--color-accent-light)', marginRight: 6, flexShrink: 0 }} />
          <strong style={{ margin: '0 4px' }}>[NEW]</strong> AI Cash Flow Forecasting is now live —{' '}
          <a
            href="#features"
            style={{ color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 500, marginLeft: 4 }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Learn more →
          </a>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss announcement"
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 3,
            }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <XIcon size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
