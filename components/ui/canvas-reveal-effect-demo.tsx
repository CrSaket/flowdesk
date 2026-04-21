"use client"

import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, Bot, ShieldCheck } from "lucide-react"
import React from "react"

import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect"

const cards = [
  {
    title: "Forecasting",
    icon: BarChart3,
    colors: [
      [79, 70, 255],
      [0, 229, 160],
    ],
    bg: "bg-[#100f2d]",
  },
  {
    title: "Operations AI",
    icon: Bot,
    colors: [
      [236, 72, 153],
      [79, 70, 255],
    ],
    bg: "bg-black",
  },
  {
    title: "Compliance",
    icon: ShieldCheck,
    colors: [[125, 211, 252]],
    bg: "bg-[#0b1733]",
  },
]

export default function CanvasRevealEffectDemo() {
  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-8 py-20 lg:flex-row">
      {cards.map((card) => (
        <DemoCard key={card.title} {...card} />
      ))}
    </div>
  )
}

function DemoCard({
  title,
  icon: Icon,
  colors,
  bg,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  colors: number[][]
  bg: string
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/canvas-card relative mx-auto flex h-[26rem] w-full max-w-sm items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-card/40 p-6"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={3.4}
              containerClassName={bg}
              colors={colors}
              dotSize={2}
              showGradient={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white transition duration-200 group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white opacity-0 transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:opacity-100">
          {title}
        </h2>
      </div>
    </div>
  )
}

export { CanvasRevealEffectDemo as Demo }
