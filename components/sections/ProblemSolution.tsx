'use client'

import { Link2, Zap, BarChart2, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const pains = [
  { num: '01', text: "Your accounting software doesn't know your sales pipeline is down 40%." },
  { num: '02', text: 'You find out about cash shortfalls 2 weeks too late.' },
  { num: '03', text: 'Financial reports take your team 6 hours each month to compile.' },
  { num: '04', text: 'Your "dashboard" is actually 4 browser tabs open at once.' },
]

const solutions: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Link2,     title: 'Everything connected, all the time',     text: 'FlowDesk syncs your sales, finances, and operations in real time — so your numbers are never stale.' },
  { icon: Zap,       title: 'Get ahead of problems, not behind them', text: 'AI-powered forecasting surfaces cash issues 14 days in advance so you can act, not react.' },
  { icon: BarChart2, title: 'Reports in seconds, not hours',          text: "Auto-generated P&Ls, dashboards, and summaries your accountant will actually love." },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const painVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
}

const solutionVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
}

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay } },
})

export default function ProblemSolution() {
  return (
    <div style={{ borderTop: '1px solid var(--color-border)', maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
      <div id="problem-solution" style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: 0, position: 'relative' }}>
        <div className="problem-solution-divider" />

        {/* Problem Column */}
        <div style={{ padding: '80px 48px 80px 0', background: 'linear-gradient(135deg, rgba(180,20,20,0.03) 0%, transparent 70%)' }}>
          <motion.p
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 16 }}
          >
            The Problem
          </motion.p>
          <motion.h2
            variants={fadeUp(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 32 }}
          >
            Running a business means juggling 7 different tools — and none of them talk to each other.
          </motion.h2>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {pains.map(p => (
              <motion.li key={p.num} variants={painVariants} className="pain-item">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }}>{p.num}</span>
                <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{p.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Solution Column */}
        <div style={{ padding: '80px 0 80px 64px', background: 'linear-gradient(135deg, transparent, rgba(79,70,255,0.04) 100%)' }}>
          <motion.p
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 16 }}
          >
            The Solution
          </motion.p>
          <motion.h2
            variants={fadeUp(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 32 }}
          >
            One workspace. Every number that matters.
          </motion.h2>
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {solutions.map(s => (
              <motion.div key={s.title} variants={solutionVariants} className="solution-item">
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(79,70,255,0.12)', border: '1px solid rgba(79,70,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={15} style={{ color: 'var(--color-accent-light)' }} />
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s.text}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
