'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const testimonials = [
  { stars: 5, quote: 'We used to spend Sunday nights reconciling accounts. Now I check FlowDesk for 10 minutes Monday morning and I know exactly where we stand. Cash flow anxiety is gone.', initials: 'SM', name: 'Sarah M.', role: 'Founder, Bright & Co.', gradient: 'linear-gradient(135deg,#4F46FF,#00E5A0)' },
  { stars: 5, quote: 'The AI forecasting caught a $40K shortfall coming in week 3. We moved a client milestone forward and avoided the crunch entirely. That single alert paid for 5 years of FlowDesk.', initials: 'JK', name: 'James K.', role: 'CEO, NovaBuild Construction', gradient: 'linear-gradient(135deg,#FF6B6B,#FFC85C)' },
  { stars: 5, quote: 'Our monthly close used to take 3 days of back-and-forth with our accountant. Now it\'s 4 hours — and she\'s the one telling us to keep using it.', initials: 'RP', name: 'Rachel P.', role: 'Operations Director, PeakMetrics Agency', gradient: 'linear-gradient(135deg,#6E67FF,#2E2A99)' },
  { stars: 5, quote: 'We run 4 restaurant locations. Keeping track of each one separately was a nightmare. FlowDesk gives me a single view — and the inventory integration alone saves us 12 hours a week.', initials: 'DT', name: 'David T.', role: 'Owner, FoodGroup Ltd.', gradient: 'linear-gradient(135deg,#00E5A0,#4F46FF)' },
  { stars: 5, quote: 'I pitched FlowDesk to our CFO with a one-page ROI breakdown the AI Advisor generated in 30 seconds. She approved it before I left the room.', initials: 'AL', name: 'Alex L.', role: 'Finance Lead, Vertix Labs', gradient: 'linear-gradient(135deg,#FFC85C,#FF6B6B)' },
  { stars: 5, quote: 'The invoice automation collected $28K in overdue payments in the first month. I didn\'t send a single follow-up email myself. The system just handled it.', initials: 'MC', name: 'Maria C.', role: 'Founder, OakField Professional Services', gradient: 'linear-gradient(135deg,#2E2A99,#6E67FF)' },
]

const CARD_W = 380

export default function Testimonials() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [dotIdx, setDotIdx] = useState(0)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.pageX - (carouselRef.current?.offsetLeft ?? 0)
    scrollLeft.current = carouselRef.current?.scrollLeft ?? 0
    carouselRef.current?.classList.add('grabbing')
  }
  const onMouseLeave = () => { isDragging.current = false; carouselRef.current?.classList.remove('grabbing') }
  const onMouseUp = () => { isDragging.current = false; carouselRef.current?.classList.remove('grabbing') }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current.offsetLeft ?? 0)
    carouselRef.current.scrollLeft = scrollLeft.current - (x - startX.current)
  }
  const onScroll = () => {
    if (!carouselRef.current) return
    const idx = Math.round(carouselRef.current.scrollLeft / (CARD_W + 20))
    setDotIdx(idx)
  }

  return (
    <section id="testimonials" style={{ padding: '120px 48px', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 16 }}>Customer Stories</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
          Built for the businesses<br />that build everything else.
        </h2>
      </motion.div>

      <div
        ref={carouselRef}
        className="testimonials-carousel"
        style={{ marginTop: 48 }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onScroll={onScroll}
      >
        <div style={{ display: 'flex', gap: 20, padding: '8px 4px 24px', width: 'max-content' }}>
          {testimonials.map(t => (
            <div key={t.name} className="testimonial-card">
              <div style={{ color: 'var(--color-warning)', fontSize: 13, marginBottom: 14, letterSpacing: 2 }}>{'★'.repeat(t.stars)}</div>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: 20 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff', background: t.gradient }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
        <button
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          aria-label="Previous"
          onClick={() => carouselRef.current?.scrollBy({ left: -(CARD_W + 20), behavior: 'smooth' })}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-dim)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
        >←</button>
        <button
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          aria-label="Next"
          onClick={() => carouselRef.current?.scrollBy({ left: CARD_W + 20, behavior: 'smooth' })}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-dim)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
        >→</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`dot${dotIdx === i ? ' active' : ''}`}
              onClick={() => carouselRef.current?.scrollTo({ left: i * (CARD_W + 20), behavior: 'smooth' })}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
