"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"

const previewData = {
  shap: {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=560&h=320&fit=crop",
    title: "SHAP Attribution",
    subtitle: "Drivers ranked by impact, updated in real time",
  },
  plain: {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=560&h=320&fit=crop",
    title: "Plain-English AI",
    subtitle: "Every insight explained in natural language",
  },
  cashflow: {
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=560&h=320&fit=crop",
    title: "Cash Flow Visibility",
    subtitle: "90-day forecasts with confidence intervals",
  },
}

const styles = `
  .hp-container {
    position: relative;
    overflow: hidden;
    padding: 40px 0;
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
  }

  .hp-ambient-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(79, 70, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: hp-pulse 8s ease-in-out infinite;
  }

  @keyframes hp-pulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
  }

  .hp-text-block {
    position: relative;
    z-index: 1;
    font-size: clamp(1.1rem, 2.2vw, 1.65rem);
    line-height: 1.7;
    color: var(--color-text-secondary);
    font-weight: 400;
    letter-spacing: -0.02em;
  }

  .hp-text-block p {
    margin-bottom: 1.4em;
    opacity: 0;
    animation: hp-fadeUp 0.8s ease forwards;
  }

  .hp-text-block p:last-child { margin-bottom: 0; }
  .hp-text-block p:nth-child(1) { animation-delay: 0.2s; }
  .hp-text-block p:nth-child(2) { animation-delay: 0.4s; }

  @keyframes hp-fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hp-hover-link {
    color: var(--color-text-primary);
    font-weight: 700;
    cursor: pointer;
    position: relative;
    display: inline-block;
    transition: color 0.3s ease;
    white-space: nowrap;
  }

  .hp-hover-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #4F46FF, #818cf8, #06B6D4);
    transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .hp-hover-link:hover {
    color: #a5b4fc;
  }

  .hp-hover-link:hover::after {
    width: 100%;
  }

  .hp-preview-card {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, opacity;
  }

  .hp-preview-card.hp-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .hp-preview-card-inner {
    background: #0D0B1E;
    border-radius: 16px;
    padding: 8px;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(79, 70, 255, 0.25),
      0 0 60px rgba(79, 70, 255, 0.12);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .hp-preview-card img {
    width: 280px;
    height: 160px;
    object-fit: cover;
    border-radius: 10px;
    display: block;
  }

  .hp-preview-card-title {
    padding: 12px 8px 6px;
    font-size: 0.85rem;
    color: var(--color-text-primary);
    font-weight: 700;
    font-family: var(--font-display);
    letter-spacing: -0.01em;
  }

  .hp-preview-card-subtitle {
    padding: 0 8px 10px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.4;
  }
`

const HoverLink = ({
  previewKey,
  children,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}: {
  previewKey: string
  children: React.ReactNode
  onHoverStart: (key: string, e: React.MouseEvent) => void
  onHoverMove: (e: React.MouseEvent) => void
  onHoverEnd: () => void
}) => {
  return (
    <span
      className="hp-hover-link"
      onMouseEnter={(e) => onHoverStart(previewKey, e)}
      onMouseMove={onHoverMove}
      onMouseLeave={onHoverEnd}
    >
      {children}
    </span>
  )
}

const PreviewCard = ({
  data,
  position,
  isVisible,
  cardRef,
}: {
  data: (typeof previewData)[keyof typeof previewData] | null
  position: { x: number; y: number }
  isVisible: boolean
  cardRef: React.RefObject<HTMLDivElement>
}) => {
  if (!data) return null

  return (
    <div
      ref={cardRef}
      className={`hp-preview-card ${isVisible ? "hp-visible" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="hp-preview-card-inner">
        <img
          src={data.image || "/placeholder.svg"}
          alt={data.title || ""}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="hp-preview-card-title">{data.title}</div>
        <div className="hp-preview-card-subtitle">{data.subtitle}</div>
      </div>
    </div>
  )
}

export function HoverPreview() {
  const [activePreview, setActivePreview] = useState<(typeof previewData)[keyof typeof previewData] | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>

  useEffect(() => {
    Object.entries(previewData).forEach(([, data]) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = data.image
    })
  }, [])

  const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    const cardWidth = 300
    const cardHeight = 250
    const offsetY = 20

    let x = e.clientX - cardWidth / 2
    let y = e.clientY - cardHeight - offsetY

    if (x + cardWidth > window.innerWidth - 20) x = window.innerWidth - cardWidth - 20
    if (x < 20) x = 20
    if (y < 20) y = e.clientY + offsetY

    setPosition({ x, y })
  }, [])

  const handleHoverStart = useCallback(
    (key: string, e: React.MouseEvent) => {
      setActivePreview(previewData[key as keyof typeof previewData])
      setIsVisible(true)
      updatePosition(e)
    },
    [updatePosition],
  )

  const handleHoverMove = useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) {
        updatePosition(e)
      }
    },
    [isVisible, updatePosition],
  )

  const handleHoverEnd = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="hp-container">
        <div className="hp-ambient-glow" />

        <div className="hp-text-block">
          <p>
            FlowDesk uses{" "}
            <HoverLink
              previewKey="shap"
              onHoverStart={handleHoverStart}
              onHoverMove={handleHoverMove}
              onHoverEnd={handleHoverEnd}
            >
              SHAP attribution
            </HoverLink>{" "}
            to surface the exact drivers behind every forecast — ranked by impact, updated in real time.
          </p>
          <p>
            Every metric shift becomes a{" "}
            <HoverLink
              previewKey="plain"
              onHoverStart={handleHoverStart}
              onHoverMove={handleHoverMove}
              onHoverEnd={handleHoverEnd}
            >
              plain-English AI narrative
            </HoverLink>{" "}
            paired with{" "}
            <HoverLink
              previewKey="cashflow"
              onHoverStart={handleHoverStart}
              onHoverMove={handleHoverMove}
              onHoverEnd={handleHoverEnd}
            >
              90-day cash flow visibility
            </HoverLink>
            {" "}— so you always know what to do next.
          </p>
        </div>

        <PreviewCard data={activePreview} position={position} isVisible={isVisible} cardRef={cardRef} />
      </div>
    </>
  )
}
