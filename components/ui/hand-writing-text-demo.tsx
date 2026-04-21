"use client"

import { HandWrittenTitle } from "@/components/ui/hand-writing-text"
import { HoverPreview } from "@/components/ui/hover-preview"

export default function HandWrittenTitleDemo() {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
      }}
    >
      {/* Left: "Why Us?" circle */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <HandWrittenTitle title="Why Us?" />
      </div>

      {/* Right: hover-preview text, left-aligned */}
      <div>
        <HoverPreview />
      </div>
    </section>
  )
}
