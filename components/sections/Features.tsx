"use client"

import RotatingGradientDemo from "@/components/ui/rotating-gradient-demo"
import Features8Demo from "@/components/ui/features-8-demo"

export default function Features() {
  return (
    <section
      id="features"
      className="w-full border-t border-border"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Rotating Gradient Feature Showcase */}
      <div className="px-6 py-16 md:px-10 md:py-20">
        <RotatingGradientDemo />
      </div>
      
      {/* Features-8 Component */}
      <div className="px-6 py-8 md:px-10 md:py-16">
        <Features8Demo />
      </div>
    </section>
  )
}
