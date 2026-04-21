"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "shap",
    name: "SHAP Attribution",
    title: "See exactly what moved the needle",
    description:
      "SHAP values decompose every AI prediction into the individual business drivers behind it — so you always know the 'why' behind each number, not just the output.",
  },
  {
    id: "plain",
    name: "Plain-English AI",
    title: "AI that speaks your language",
    description:
      "Every model output is automatically translated into plain business language. No equations, no jargon — just clear context your whole team can act on immediately.",
  },
  {
    id: "drivers",
    name: "Driver Waterfall",
    title: "Track what's moving your metrics",
    description:
      "Visualize the exact contribution of each revenue stream, cost center, and payment timing event to your overall cash position change — step by step.",
  },
  {
    id: "confidence",
    name: "Confidence Ranges",
    title: "Know when to trust the forecast",
    description:
      "Every prediction ships with a confidence interval. FlowDesk surfaces the scenarios that could push you outside those bounds — before they materialize.",
  },
] as const

type StepId = (typeof STEPS)[number]["id"]

const AUTOPLAY_INTERVAL = 4000

// ─── Step icon ────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn("h-3 w-3", className)}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

// ─── App window chrome ────────────────────────────────────────────────────────

function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,24,32,0.98)_0%,rgba(15,17,23,0.98)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
      {/* Title bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4">
        <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
        <span className="mx-auto text-[10px] uppercase tracking-[0.28em] text-white/45">
          flowdesk.app
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden p-4 md:p-5">{children}</div>
    </div>
  )
}

function AppStat({
  label,
  value,
  tone = "text-white",
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </div>
      <div className={cn("font-mono text-sm", tone)}>{value}</div>
    </div>
  )
}

// ─── Step content mockups ─────────────────────────────────────────────────────

function ShapContent() {
  const shapRows = [
    { driver: "Revenue recognition", value: "+$12.4K", bar: 74, positive: true },
    { driver: "AR collections", value: "+$9.1K", bar: 54, positive: true },
    { driver: "Payroll cycle", value: "−$18.2K", bar: 100, positive: false },
    { driver: "Vendor payments", value: "−$8.6K", bar: 51, positive: false },
    { driver: "Operating expenses", value: "−$4.0K", bar: 24, positive: false },
  ]
  return (
    <AppChrome>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white">SHAP Forecast Drivers</div>
          <div className="mt-1 text-[11px] text-white/40">What moved your 14-day cash prediction</div>
        </div>
        <div className="rounded-full bg-[#6E67FF]/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#A8A3FF]">
          Explainable AI
        </div>
      </div>
      <div className="space-y-3">
        {shapRows.map((row) => (
          <div key={row.driver} className="flex items-center gap-3">
            <div className="w-[130px] shrink-0 text-[11px] leading-4 text-white/60">
              {row.driver}
            </div>
            <div className="relative flex-1">
              {/* Track */}
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: row.positive
                      ? "linear-gradient(90deg,#00E5A0,#00c98a)"
                      : "linear-gradient(90deg,#FF6B6B,#e85555)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${row.bar}%` }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
            <div
              className={cn(
                "w-[58px] shrink-0 text-right font-mono text-[11px]",
                row.positive ? "text-emerald-300" : "text-rose-300"
              )}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-[#6E67FF]/20 bg-[#6E67FF]/10 px-4 py-3">
        <div className="text-[11px] leading-5 text-white/55">
          <span className="font-medium text-[#A8A3FF]">Net impact: </span>
          Payroll and vendor timing are the primary downside drivers this cycle. AR pull-forward can offset −$9.5K of the gap.
        </div>
      </div>
    </AppChrome>
  )
}

function PlainEnglishContent() {
  return (
    <AppChrome>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-white">AI Insight Summary</div>
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      </div>
      <div className="space-y-3">
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#A8A3FF]">
            Why your margin dipped this week
          </div>
          <div className="text-[13px] leading-6 text-white/75">
            Your gross margin fell 2.3 points because shipping costs rose 12% and one invoice cohort aged past 30 days. The retail segment in the West region is the biggest contributor.
          </div>
        </div>
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#A8A3FF]">
            What the model recommends
          </div>
          <div className="space-y-2">
            {[
              "Pull forward collections on 3 overdue invoices (−$9.5K exposure)",
              "Reprice expedited shipping for low-margin accounts",
              "Delay discretionary spend until runway clears 5 months",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] leading-5 text-white/65">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-white/30">
                  {i + 1}.
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Export summary", "Open forecast", "See SHAP drivers"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/45"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </AppChrome>
  )
}

function DriverWaterfallContent() {
  const bars = [
    { label: "Start", value: "$41.2K", delta: null, cumulative: 41.2 },
    { label: "Invoices", value: "+$18.6K", delta: 18.6, positive: true },
    { label: "Payroll", value: "−$22.4K", delta: -22.4, positive: false },
    { label: "Vendors", value: "−$9.1K", delta: -9.1, positive: false },
    { label: "AR Pull", value: "+$11.2K", delta: 11.2, positive: true },
    { label: "End", value: "$39.5K", delta: null, cumulative: 39.5 },
  ]
  const max = 55
  return (
    <AppChrome>
      <div className="mb-4">
        <div className="text-sm font-medium text-white">Cash Position Waterfall</div>
        <div className="mt-1 text-[11px] text-white/40">
          14-day driver breakdown · SHAP-attributed
        </div>
      </div>
      <div className="flex h-[160px] items-end gap-2 pb-1">
        {bars.map((bar, i) => {
          const isTotal = bar.delta === null
          const height = isTotal
            ? (bar.cumulative! / max) * 100
            : (Math.abs(bar.delta) / max) * 100
          const bgClass = isTotal
            ? "bg-[#6E67FF]"
            : bar.positive
            ? "bg-emerald-400"
            : "bg-rose-400"
          return (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                className={cn("w-full rounded-t-md", bgClass)}
                style={{ maxHeight: `${height}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              />
              <span className="text-center text-[9px] font-mono leading-3 text-white/45">
                {bar.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <AppStat label="Inflows" value="+$29.8K" tone="text-emerald-300" />
        <AppStat label="Outflows" value="−$31.5K" tone="text-rose-300" />
        <AppStat label="Net" value="−$1.7K" />
      </div>
    </AppChrome>
  )
}

function ConfidenceContent() {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"]
  const midpoints = [74, 69, 78, 65, 82, 71]
  const highs = [88, 84, 93, 80, 96, 87]
  const lows = [62, 56, 65, 52, 70, 57]
  return (
    <AppChrome>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white">Forecast Confidence</div>
          <div className="mt-1 text-[11px] text-white/40">
            Model certainty by forecast horizon
          </div>
        </div>
        <div className="rounded-full bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-300">
          6-week view
        </div>
      </div>
      <div className="flex h-[140px] items-end gap-3">
        {weeks.map((week, i) => {
          const high = highs[i]
          const low = lows[i]
          const mid = midpoints[i]
          return (
            <div key={week} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex w-full flex-col items-center">
                {/* Confidence band */}
                <motion.div
                  className="w-3 rounded-full bg-[#6E67FF]/25"
                  initial={{ height: 0 }}
                  animate={{ height: `${high - low}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  style={{ minHeight: 40 }}
                />
                {/* Midpoint dot */}
                <motion.div
                  className="absolute h-2 w-2 rounded-full bg-[#A8A3FF]"
                  style={{ top: `${100 - mid + low}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 + 0.4 }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/40">{week}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3">
        <div className="text-[11px] leading-5 text-white/55">
          <span className="font-medium text-amber-300">W3 widening detected. </span>
          A delayed vendor payment is increasing uncertainty. Scenario planning recommended for weeks 3–4.
        </div>
      </div>
    </AppChrome>
  )
}

function renderStepContent(id: StepId) {
  switch (id) {
    case "shap":
      return <ShapContent />
    case "plain":
      return <PlainEnglishContent />
    case "drivers":
      return <DriverWaterfallContent />
    case "confidence":
      return <ConfidenceContent />
  }
}

// ─── Step navigator ───────────────────────────────────────────────────────────

const stepVariants: Variants = {
  inactive: { scale: 0.9, opacity: 0.55 },
  active: { scale: 1, opacity: 1 },
}

function StepNav({
  current,
  onChange,
}: {
  current: number
  onChange: (i: number) => void
}) {
  return (
    <nav className="flex flex-wrap items-start justify-start gap-2 sm:justify-center lg:flex-col lg:items-start lg:justify-start lg:gap-3">
      {STEPS.map((step, i) => {
        const isCompleted = current > i
        const isCurrent = current === i
        const isFuture = !isCompleted && !isCurrent
        return (
          <motion.button
            key={step.id}
            onClick={() => onChange(i)}
            initial="inactive"
            animate={isCurrent ? "active" : "inactive"}
            variants={stepVariants}
            transition={{ duration: 0.25 }}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-sm font-medium transition-colors duration-300",
              isCurrent && "bg-white text-[#4F46FF]",
              isCompleted && "bg-white/10 text-white/70",
              isFuture && "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] transition-colors",
                isCurrent && "bg-[#4F46FF] text-white",
                isCompleted && "bg-white/20 text-white",
                isFuture && "bg-white/10 text-white/40"
              )}
            >
              {isCompleted ? (
                <CheckIcon className="h-2.5 w-2.5" />
              ) : (
                i + 1
              )}
            </span>
            <span className="whitespace-nowrap">{step.name}</span>
          </motion.button>
        )
      })}
    </nav>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WhyUsFeatureSteps() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % STEPS.length)
    }, AUTOPLAY_INTERVAL)
  }, [])

  useEffect(() => {
    if (isPaused) return
    resetTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, isPaused, resetTimer])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleChange = useCallback(
    (i: number) => {
      setCurrent(i)
      resetTimer()
    },
    [resetTimer]
  )

  const activeStep = STEPS[current]

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* ── Left panel ── */}
        <div className="flex flex-col gap-6 bg-[#4F46FF] p-8 lg:p-10">
          {/* Section tag */}
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
              Explainable AI
            </div>
            <h3 className="text-xl font-bold leading-tight tracking-tight text-white lg:text-2xl">
              Transparent by design.
            </h3>
          </div>

          {/* Step nav */}
          <StepNav current={current} onChange={handleChange} />

          {/* Progress dots */}
          <div className="flex gap-2 pt-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/25"
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col bg-[#0a0b0f] p-8 lg:p-10">
          {/* Step description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id + "-header"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="mb-6"
            >
              <h4 className="text-lg font-semibold leading-tight tracking-tight text-white lg:text-xl">
                {activeStep.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {activeStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* App window */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -6 }}
                transition={{
                  duration: 0.35,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="h-full min-h-[320px]"
              >
                {renderStepContent(activeStep.id)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhyUsFeatureSteps
