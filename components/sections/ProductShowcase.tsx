"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useMotionValue } from 'motion/react'

import FeatureCarousel, {
  FEATURE_CAROUSEL_LENGTH,
} from '@/components/ui/feature-carousel'

const SCROLL_PER_ITEM = 170

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export default function ProductShowcase() {
  const shellRef = useRef<HTMLDivElement>(null)
  // MotionValue: updating it does NOT trigger React re-renders
  const step = useMotionValue(0)

  useEffect(() => {
    const onScroll = () => {
      const shell = shellRef.current
      if (!shell) return
      const rect = shell.getBoundingClientRect()
      const scrollRange = Math.max(shell.offsetHeight - window.innerHeight, 1)
      const progressPx = clamp(-rect.top, 0, scrollRange)
      const nextStep =
        (progressPx / scrollRange) * Math.max(FEATURE_CAROUSEL_LENGTH - 1, 0)
      step.set(nextStep) // direct DOM update — no React render
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [step])

  const handleSelect = useCallback((index: number) => {
    const shell = shellRef.current
    if (!shell) return
    const scrollRange = Math.max(shell.offsetHeight - window.innerHeight, 1)
    const shellTop = window.scrollY + shell.getBoundingClientRect().top
    const progress =
      FEATURE_CAROUSEL_LENGTH > 1 ? index / (FEATURE_CAROUSEL_LENGTH - 1) : 0
    window.scrollTo({
      top: shellTop + scrollRange * progress,
      behavior: 'smooth',
    })
  }, [])

  return (
    <section
      id="product-showcase"
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        padding: '120px 0 0',
        maxWidth: '100%',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4.5vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: 56,
          }}
        >
          See your entire business.
          <br />
          At a glance.
        </h2>
      </div>

      <div
        ref={shellRef}
        style={{
          position: 'relative',
          height: `calc(100vh + ${(FEATURE_CAROUSEL_LENGTH - 1) * SCROLL_PER_ITEM}px)`,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <FeatureCarousel
            autoPlay={false}
            step={step}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </section>
  )
}
