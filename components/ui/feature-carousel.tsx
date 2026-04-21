"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  motion,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react"
import {
  AiCloudIcon,
  CheckmarkCircle01Icon,
  CommandFreeIcons,
  DashboardSquare01Icon,
  GlobalSearchIcon,
  MagicWandIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

const FEATURES = [
  {
    id: "forecast",
    label: "Cash Forecasting",
    icon: DashboardSquare01Icon,
    description:
      "Project runway, model scenarios, and catch shortfalls before they hit operations.",
  },
  {
    id: "workspace",
    label: "Ops Workspace",
    icon: CommandFreeIcons,
    description:
      "Keep finance, ops, and leadership aligned around the same live operating picture.",
  },
  {
    id: "advisor",
    label: "AI Advisor",
    icon: AiCloudIcon,
    description:
      "Ask what changed, what is at risk, and what to do next without digging through reports.",
  },
  {
    id: "analytics",
    label: "Live Analytics",
    icon: DashboardSquare01Icon,
    description:
      "See revenue movement, expense pressure, and margin shifts as the business changes.",
  },
  {
    id: "invoicing",
    label: "Invoice Automation",
    icon: MagicWandIcon,
    description:
      "Generate, send, and follow up on invoices with less manual work from your team.",
  },
  {
    id: "mobile",
    label: "Mobile Review",
    icon: SmartPhone01Icon,
    description:
      "Check health, approve actions, and stay in control from any device when you are away.",
  },
  {
    id: "security",
    label: "Enterprise Security",
    icon: CheckmarkCircle01Icon,
    description:
      "Protect sensitive financial and operating data with the controls larger teams expect.",
  },
  {
    id: "benchmarks",
    label: "Global Visibility",
    icon: GlobalSearchIcon,
    description:
      "Compare locations, markets, and teams without losing the detail that drives decisions.",
  },
]

const AUTO_PLAY_INTERVAL = 3000
const ITEM_HEIGHT = 65
export const FEATURE_CAROUSEL_LENGTH = FEATURES.length

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

const getWrappedDist = (index: number, step: number) =>
  wrap(-(FEATURES.length / 2), FEATURES.length / 2, index - step)

// ─── AppStat ────────────────────────────────────────────────────────────────

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
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className={cn("font-mono text-sm md:text-base", tone)}>{value}</div>
    </div>
  )
}

// ─── Feature preview content (unchanged) ────────────────────────────────────

function renderFeaturePreview(featureId: string) {
  switch (featureId) {
    case "forecast":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-3 gap-3">
            <AppStat label="Cash" value="$37.4K" />
            <AppStat label="Burn" value="$18.6K" tone="text-rose-300" />
            <AppStat label="Runway" value="4.8 mo" tone="text-emerald-300" />
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">14-day forecast</div>
                <div className="mt-1 text-xs text-white/45">Updated from live payables and invoices</div>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">Stable</div>
            </div>
            <div className="space-y-3">
              {[["Week 1", 72, "$28.4K"], ["Week 2", 84, "$33.1K"], ["Week 3", 66, "$25.7K"], ["Week 4", 92, "$37.4K"]].map(([label, width, value]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-white/45">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#6E67FF_0%,#00E5A0_100%)]" style={{ width: `${width}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-[11px] text-white/75">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case "workspace":
      return (
        <div className="grid h-full grid-cols-[1.1fr_0.9fr] gap-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 text-sm font-medium text-white">Team workflow</div>
            <div className="space-y-3">
              {[["Close books", "Finance", "Done"], ["Vendor review", "Ops", "Today"], ["Headcount plan", "Leadership", "Next"], ["Collections follow-up", "AR", "Queued"]].map(([task, team, status]) => (
                <div key={task as string} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                  <div>
                    <div className="text-xs font-medium text-white">{task}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">{team}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/75">{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-medium text-white">Alignment</div>
              <div className="flex -space-x-2">
                {["FD", "OP", "AR", "CEO"].map((item) => (
                  <div key={item} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#6E67FF] text-[10px] font-semibold text-white">{item}</div>
                ))}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-[#6E67FF]" />
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-medium text-white">Team notes</div>
              <div className="space-y-2 text-xs text-white/65">
                <div className="rounded-xl bg-black/10 px-3 py-2">Ops confirmed vendor timing changes.</div>
                <div className="rounded-xl bg-black/10 px-3 py-2">Finance adjusted forecast to reflect delay.</div>
              </div>
            </div>
          </div>
        </div>
      )
    case "advisor":
      return (
        <div className="flex h-full flex-col gap-3">
          <div className="self-end rounded-[1.25rem] rounded-br-md bg-[#4F46FF] px-4 py-3 text-sm text-white">What is putting pressure on margin this week?</div>
          <div className="max-w-[88%] rounded-[1.25rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/75">Margin softness is coming from two areas: shipping cost is up 12% and one invoice cohort is aging beyond 30 days. The largest impact is the retail segment in the West region.</div>
          <div className="self-end rounded-[1.25rem] rounded-br-md bg-[#4F46FF] px-4 py-3 text-sm text-white">What should I do next?</div>
          <div className="max-w-[88%] rounded-[1.25rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/75">1. Pull forward collections on three overdue invoices. 2. Reprice expedited shipping for low-margin accounts. 3. Delay discretionary spend until runway returns above five months.</div>
          <div className="mt-auto flex flex-wrap gap-2">
            {["Export summary", "Open forecast", "Draft follow-up"].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-black/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/55">{item}</span>
            ))}
          </div>
        </div>
      )
    case "analytics":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-4 gap-3">
            <AppStat label="Revenue" value="$84.2K" />
            <AppStat label="GM%" value="38.4%" />
            <AppStat label="CAC" value="$412" />
            <AppStat label="LTV" value="$5.8K" />
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-white">Live performance</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Last 7 periods</div>
            </div>
            <div className="flex h-[180px] items-end gap-3">
              {[44, 56, 48, 76, 64, 90, 70].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex w-full items-end gap-1.5">
                    <div className="flex-1 rounded-t-md bg-[#6E67FF]" style={{ height: `${value}%` }} />
                    <div className="flex-1 rounded-t-md bg-white/20" style={{ height: `${Math.max(value - 18, 20)}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/45">P{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case "invoicing":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-4">
          <div className="rounded-[1.4rem] border border-white/10 bg-[#6E67FF]/15 p-4">
            <div className="text-sm font-medium text-white">Auto-follow-up enabled</div>
            <div className="mt-2 text-xs leading-5 text-white/60">12 reminders are queued based on payment behavior and invoice age.</div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 text-sm font-medium text-white">Recent invoices</div>
            <div className="space-y-3">
              {[["Bright & Co.", "$4,200", "Paid", "bg-emerald-400"], ["AgencyGroup", "$8,750", "Due", "bg-amber-300"], ["NovaBuild", "$12,000", "Paid", "bg-emerald-400"], ["PeakMetrics", "$2,400", "Queued", "bg-[#6E67FF]"]].map(([client, amount, status, tone]) => (
                <div key={client as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full", tone as string)} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{client}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">{status}</div>
                  </div>
                  <span className="font-mono text-xs text-white/70">{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case "mobile":
      return (
        <div className="grid h-full place-items-center">
          <div className="relative h-full max-h-[310px] w-[180px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,22,31,1)_0%,rgba(11,12,18,1)_100%)] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
            <div className="mb-3 flex justify-center"><div className="h-1.5 w-16 rounded-full bg-white/10" /></div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#6E67FF]/15 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Today</div>
                <div className="mt-1 text-base font-medium text-white">$37.4K</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 text-xs text-white/55">Approvals</div>
                <div className="space-y-2">
                  {["Vendor payout", "Pricing update", "Forecast export"].map((item) => (
                    <div key={item} className="rounded-xl bg-black/10 px-3 py-2 text-[11px] text-white/75">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case "security":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-3 gap-3">
            <AppStat label="SSO" value="Enabled" tone="text-emerald-300" />
            <AppStat label="MFA" value="Required" />
            <AppStat label="Backups" value="Hourly" />
          </div>
          <div className="grid flex-1 grid-cols-[1fr_0.92fr] gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 text-sm font-medium text-white">Access controls</div>
              <div className="space-y-3">
                {[["Admin", "4 users"], ["Finance", "9 users"], ["Ops", "12 users"], ["View-only", "18 users"]].map(([role, count]) => (
                  <div key={role as string} className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-3 text-xs text-white/75">
                    <span>{role}</span>
                    <span className="font-mono text-white/45">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 text-sm font-medium text-white">Audit log</div>
              <div className="space-y-3">
                {["SSO policy updated", "Payroll export approved", "Bank sync refreshed", "Role access reviewed"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-3 text-xs text-white/65">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    case "benchmarks":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-4">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 text-sm font-medium text-white">Region comparison</div>
            <div className="text-xs leading-5 text-white/45">Compare margin and growth across teams without losing local detail.</div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="space-y-4">
              {[["North America", 84], ["Europe", 66], ["APAC", 58], ["Remote Ops", 74]].map(([region, width]) => (
                <div key={region as string}>
                  <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                    <span>{region}</span>
                    <span className="font-mono text-white/45">{width}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#6E67FF_0%,#ffffff_100%)]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}

// ─── FeatureChip ─────────────────────────────────────────────────────────────
// Each chip owns its own motion values — no parent re-render needed

interface ChipProps {
  index: number
  feature: (typeof FEATURES)[0]
  stepMV: MotionValue<number>
  isActive: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function FeatureChip({ index, feature, stepMV, isActive, onClick, onMouseEnter, onMouseLeave }: ChipProps) {
  const y = useTransform(stepMV, (s) => getWrappedDist(index, s) * ITEM_HEIGHT)
  const opacity = useTransform(stepMV, (s) => 1 - Math.abs(getWrappedDist(index, s)) * 0.25)

  return (
    <motion.div
      style={{ y, opacity, height: ITEM_HEIGHT, width: "fit-content", willChange: "transform, opacity" }}
      className="absolute flex items-center justify-start"
    >
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "group relative flex items-center gap-4 rounded-full border px-6 py-3.5 text-left transition-all duration-700 md:px-10 md:py-5 lg:px-8 lg:py-4",
          isActive
            ? "z-10 border-white bg-white text-[#4F46FF]"
            : "border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white"
        )}
      >
        <div className={cn("flex items-center justify-center transition-colors duration-500", isActive ? "text-[#4F46FF]" : "text-white/40")}>
          <HugeiconsIcon icon={feature.icon} size={18} strokeWidth={2} />
        </div>
        <span className="whitespace-nowrap text-sm font-normal uppercase tracking-tight md:text-[15px]">
          {feature.label}
        </span>
      </button>
    </motion.div>
  )
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────
// Each card owns its own motion values — updates on scroll without React renders

interface CardProps {
  index: number
  feature: (typeof FEATURES)[0]
  stepMV: MotionValue<number>
  isActive: boolean
}

function FeatureCard({ index, feature, stepMV, isActive }: CardProps) {
  const x = useTransform(stepMV, (s) => {
    const clamped = Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s)))
    return clamped * 112
  })
  const scaleVal = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return 1 - depth * 0.16
  })
  const opacityVal = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return depth < 1.2 ? 1 - depth * 0.42 : 0
  })
  const rotateVal = useTransform(stepMV, (s) => {
    const clamped = Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s)))
    return clamped * 3
  })
  const zIndexVal = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return Math.round(30 - depth * 10)
  })
  const windowOpacity = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return 0.72 + Math.max(0, 1 - depth) * 0.28
  })
  const descOpacity = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return Math.max(0, 1 - depth)
  })
  const descY = useTransform(stepMV, (s) => {
    const depth = Math.abs(Math.max(-1.2, Math.min(1.2, getWrappedDist(index, s))))
    return (1 - Math.max(0, 1 - depth)) * 12
  })

  return (
    <motion.div
      style={{
        x,
        scale: scaleVal,
        opacity: opacityVal,
        rotate: rotateVal,
        zIndex: zIndexVal,
        willChange: "transform, opacity",
        pointerEvents: isActive ? "auto" : "none",
      }}
      className="absolute inset-0 origin-center overflow-hidden rounded-[2rem] border-4 border-background bg-background md:rounded-[2.8rem] md:border-8"
    >
      {/* App window */}
      <motion.div className="absolute inset-0 p-4 md:p-5 lg:p-6" style={{ opacity: windowOpacity }}>
        <div className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,24,32,0.98)_0%,rgba(15,17,23,0.98)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
          <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
            <span className="mx-auto text-[10px] uppercase tracking-[0.28em] text-white/45">flowdesk.app</span>
          </div>
          <div className="flex-1 overflow-hidden p-4 pb-24 md:p-5 md:pb-24">
            {renderFeaturePreview(feature.id)}
          </div>
        </div>
      </motion.div>

      {/* Description overlay */}
      <motion.div
        style={{ opacity: descOpacity, y: descY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 pt-32"
      >
        <p className="text-xl font-normal leading-tight tracking-tight text-white drop-shadow-md md:text-2xl">
          {feature.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── FeatureCarousel ──────────────────────────────────────────────────────────

interface FeatureCarouselProps {
  step?: MotionValue<number>
  autoPlay?: boolean
  onSelect?: (index: number) => void
}

export function FeatureCarousel({
  step: controlledStep,
  autoPlay = true,
  onSelect,
}: FeatureCarouselProps) {
  const internalStep = useMotionValue(0)
  const stepMV = controlledStep ?? internalStep

  // activeIndex: state only — only re-renders when the integer card changes
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMotionValueEvent(stepMV, "change", (latest) => {
    const next = ((Math.round(latest) % FEATURES.length) + FEATURES.length) % FEATURES.length
    setActiveIndex((prev) => (prev === next ? prev : next))
  })

  // autoPlay drives internalStep with a smooth spring animation
  useEffect(() => {
    if (!autoPlay || controlledStep !== undefined || isPaused) return
    const interval = setInterval(() => {
      animate(internalStep, internalStep.get() + 1, {
        type: "spring",
        stiffness: 220,
        damping: 28,
        mass: 0.8,
      })
    }, AUTO_PLAY_INTERVAL)
    return () => clearInterval(interval)
  }, [autoPlay, controlledStep, isPaused, internalStep])

  useEffect(() => {
    return () => { if (resumeRef.current) clearTimeout(resumeRef.current) }
  }, [])

  const handleChipClick = useCallback((index: number) => {
    if (onSelect) {
      onSelect(index)
      return
    }
    const diff = (index - activeIndex + FEATURES.length) % FEATURES.length
    if (diff > 0) {
      animate(internalStep, internalStep.get() + diff, {
        type: "spring",
        stiffness: 220,
        damping: 28,
        mass: 0.8,
      })
    }
  }, [onSelect, activeIndex, internalStep])

  const pauseAutoPlay = useCallback(() => {
    if (!autoPlay || controlledStep !== undefined) return
    setIsPaused(true)
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => setIsPaused(false), 1400)
  }, [autoPlay, controlledStep])

  return (
    <div className="mx-auto w-full max-w-7xl md:px-8">
      <div className="relative flex min-h-[600px] flex-col overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/20 lg:min-h-0 lg:flex-row lg:rounded-[4rem] lg:aspect-video">

        {/* Left panel — chips */}
        <div className="relative z-30 flex min-h-[350px] w-full flex-col items-start justify-center overflow-hidden bg-[#4F46FF] px-8 md:min-h-[450px] md:px-16 lg:h-full lg:w-[40%] lg:pl-16">
          <div className="relative z-20 flex h-full w-full items-center justify-center lg:justify-start">
            {FEATURES.map((feature, index) => (
              <FeatureChip
                key={feature.id}
                index={index}
                feature={feature}
                stepMV={stepMV}
                isActive={index === activeIndex}
                onClick={() => handleChipClick(index)}
                onMouseEnter={() => { if (autoPlay && controlledStep === undefined) setIsPaused(true) }}
                onMouseLeave={pauseAutoPlay}
              />
            ))}
          </div>
        </div>

        {/* Right panel — cards */}
        <div className="relative flex min-h-[500px] flex-1 items-center justify-center overflow-hidden border-t border-border/20 bg-secondary/30 px-6 py-16 md:min-h-[600px] md:px-12 md:py-24 lg:h-full lg:border-l lg:border-t-0 lg:px-10 lg:py-16">
          <div className="relative flex aspect-[4/5] w-full max-w-[420px] items-center justify-center">
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                index={index}
                feature={feature}
                stepMV={stepMV}
                isActive={index === activeIndex}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default FeatureCarousel
