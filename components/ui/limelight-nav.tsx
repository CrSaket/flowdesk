'use client'

import React, { useState, useRef, useLayoutEffect, cloneElement } from 'react'
import { Lock } from 'lucide-react'

// --- Types ---

export type NavItem = {
  id: string | number
  icon: React.ReactElement
  label?: string
  onClick?: () => void
  locked?: boolean
}

type LimelightNavProps = {
  items?: NavItem[]
  activeIndex?: number          // controlled — set this from outside to sync with router
  defaultActiveIndex?: number   // uncontrolled initial
  onTabChange?: (index: number) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
  limelightClassName?: string
  iconContainerClassName?: string
  iconClassName?: string
}

export const LimelightNav = ({
  items = [],
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onTabChange,
  orientation = 'horizontal',
  className = '',
  limelightClassName = '',
  iconContainerClassName = '',
  iconClassName = '',
}: LimelightNavProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex)
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex

  const [isReady, setIsReady] = useState(false)
  const navItemRefs = useRef<(HTMLElement | null)[]>([])
  const limelightRef = useRef<HTMLDivElement | null>(null)

  const isVertical = orientation === 'vertical'

  useLayoutEffect(() => {
    if (items.length === 0) return
    const limelight = limelightRef.current
    const activeItem = navItemRefs.current[activeIndex]
    if (limelight && activeItem) {
      if (isVertical) {
        limelight.style.top = `${activeItem.offsetTop}px`
        limelight.style.height = `${activeItem.offsetHeight}px`
      } else {
        limelight.style.left = `${activeItem.offsetLeft}px`
        limelight.style.width = `${activeItem.offsetWidth}px`
      }
      if (!isReady) setTimeout(() => setIsReady(true), 50)
    }
  }, [activeIndex, isReady, items, isVertical])

  if (items.length === 0) return null

  const handleItemClick = (index: number, itemOnClick?: () => void, locked?: boolean) => {
    // Don't move the limelight for locked items — just fire the click so the
    // parent can show the "train a model" message
    if (!locked) {
      setInternalIndex(index)
      onTabChange?.(index)
    }
    itemOnClick?.()
  }

  /* ── Vertical layout ── */
  if (isVertical) {
    return (
      <nav
        className={`relative flex flex-col rounded-xl bg-card text-foreground border py-1 px-1 ${className}`}
      >
        {items.map(({ id, icon, label, onClick, locked }, index) => {
          const isActive = activeIndex === index
          const iconOpacity = locked ? 'opacity-25' : isActive ? 'opacity-100' : 'opacity-35'
          return (
            <button
              key={id}
              ref={el => { navItemRefs.current[index] = el }}
              className={`relative z-20 flex w-full items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 border-none bg-transparent ${
                locked ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${iconContainerClassName}`}
              onClick={() => handleItemClick(index, onClick, locked)}
              aria-label={label}
              type="button"
            >
              {/* Icon + optional lock badge */}
              <span style={{ position: 'relative', flexShrink: 0, display: 'inline-flex' }}>
                {cloneElement(icon, {
                  className: `w-[18px] h-[18px] flex-shrink-0 transition-opacity duration-150 ${iconOpacity} ${(icon.props as any).className ?? ''} ${iconClassName}`,
                })}
                {locked && (
                  <span style={{
                    position: 'absolute', bottom: -3, right: -5,
                    width: 12, height: 12,
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Lock size={7} color="var(--color-text-muted)" />
                  </span>
                )}
              </span>
              {label && (
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 flex-1 text-left ${iconOpacity}`}
                >
                  {label}
                </span>
              )}
            </button>
          )
        })}

        {/* Limelight bar — left edge, height matches active item */}
        <div
          ref={limelightRef}
          className={`absolute left-0 z-10 w-[3px] rounded-full bg-primary ${limelightClassName}`}
          style={{
            top: '-999px',
            height: 40,
            boxShadow: '18px 0 20px rgba(79,70,255,0.5)',
            transition: isReady ? 'top 280ms cubic-bezier(0.22,1,0.36,1), height 280ms cubic-bezier(0.22,1,0.36,1)' : 'none',
          }}
        >
          {/* Cone glow fanning right */}
          <div
            className="absolute bg-gradient-to-r from-primary/25 to-transparent pointer-events-none"
            style={{
              left: 3,
              top: '-30%',
              width: 56,
              height: '160%',
              clipPath: 'polygon(100% 5%, 0 25%, 0 75%, 100% 95%)',
            }}
          />
        </div>
      </nav>
    )
  }

  /* ── Horizontal layout ── */
  return (
    <nav
      className={`relative inline-flex items-center rounded-xl bg-card text-foreground border px-1 ${className}`}
      style={{ height: 52 }}
    >
      {items.map(({ id, icon, label, onClick, locked }, index) => {
        const isActive = activeIndex === index
        const iconOpacity = locked ? 'opacity-25' : isActive ? 'opacity-100' : 'opacity-35'
        return (
          <button
            key={id}
            ref={el => { navItemRefs.current[index] = el }}
            className={`relative z-20 flex h-full items-center justify-center gap-2 px-4 rounded-lg transition-all duration-150 border-none bg-transparent ${
              locked ? 'cursor-not-allowed' : 'cursor-pointer'
            } ${iconContainerClassName}`}
            onClick={() => handleItemClick(index, onClick, locked)}
            aria-label={label}
            type="button"
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              {cloneElement(icon, {
                className: `w-[18px] h-[18px] transition-opacity duration-150 ${iconOpacity} ${(icon.props as any).className ?? ''} ${iconClassName}`,
              })}
              {locked && (
                <span style={{
                  position: 'absolute', bottom: -3, right: -5,
                  width: 12, height: 12,
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Lock size={7} color="var(--color-text-muted)" />
                </span>
              )}
            </span>
            {label && (
              <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${iconOpacity}`}>
                {label}
              </span>
            )}
          </button>
        )
      })}

      {/* Limelight bar — top edge, width matches active item */}
      <div
        ref={limelightRef}
        className={`absolute top-0 z-10 h-[3px] rounded-full bg-primary ${limelightClassName}`}
        style={{
          left: '-999px',
          width: 48,
          boxShadow: '0 18px 20px rgba(79,70,255,0.5)',
          transition: isReady ? 'left 280ms cubic-bezier(0.22,1,0.36,1), width 280ms cubic-bezier(0.22,1,0.36,1)' : 'none',
        }}
      >
        {/* Cone glow beneath the bar */}
        <div
          className="absolute bg-gradient-to-b from-primary/25 to-transparent pointer-events-none"
          style={{
            left: '-30%',
            top: 3,
            width: '160%',
            height: 48,
            clipPath: 'polygon(5% 100%, 25% 0, 75% 0, 95% 100%)',
          }}
        />
      </div>
    </nav>
  )
}
