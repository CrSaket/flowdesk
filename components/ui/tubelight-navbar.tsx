"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { LogIn, type LucideIcon } from "lucide-react"
import Link from "next/link"

import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  matchIds?: string[]
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  brandHref?: string
  brandLabel?: string
  authHref?: string
  authLabel?: string
  dashHref?: string
  dashLabel?: string
}

function resolveSectionIds(item: NavItem) {
  if (item.matchIds?.length) {
    return item.matchIds
  }

  if (!item.url.startsWith("#")) {
    return []
  }

  const id = item.url.slice(1)
  return id ? [id] : []
}

export function NavBar({
  items,
  className,
  brandHref,
  brandLabel,
  authHref,
  authLabel,
  dashHref,
  dashLabel,
}: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "")
  const pendingScrollRef = useRef<{
    element: HTMLElement
    name: string
  } | null>(null)
  const pendingScrollTimeoutRef = useRef<number | null>(null)

  const clearPendingScroll = () => {
    pendingScrollRef.current = null

    if (pendingScrollTimeoutRef.current !== null) {
      window.clearTimeout(pendingScrollTimeoutRef.current)
      pendingScrollTimeoutRef.current = null
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      return
    }

    const getSections = () =>
      items
        .flatMap((item) =>
          resolveSectionIds(item).map((id) => ({
            id,
            name: item.name,
          })),
        )
        .map((section) => ({
          ...section,
          element: document.getElementById(section.id),
        }))
        .filter(
          (
            section,
          ): section is typeof section & { element: HTMLElement } =>
            section.element instanceof HTMLElement,
        )
        .sort((left, right) => left.element.offsetTop - right.element.offsetTop)

    let sections = getSections()

    const syncActiveTab = () => {
      if (sections.length === 0) {
        return
      }

      const offset =
        window.innerWidth < 640 ? window.innerHeight * 0.45 : 160
      const pendingScroll = pendingScrollRef.current

      if (pendingScroll) {
        const rect = pendingScroll.element.getBoundingClientRect()

        if (rect.top <= offset && rect.bottom > offset) {
          clearPendingScroll()
        } else {
          setActiveTab((previous) =>
            previous === pendingScroll.name ? previous : pendingScroll.name,
          )
          return
        }
      }

      let current = items[0]?.name ?? ""

      for (const section of sections) {
        if (window.scrollY + offset >= section.element.offsetTop) {
          current = section.name
        }
      }

      setActiveTab((previous) => (previous === current ? previous : current))
    }

    const handleResize = () => {
      sections = getSections()
      syncActiveTab()
    }

    syncActiveTab()
    window.addEventListener("scroll", syncActiveTab, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      clearPendingScroll()
      window.removeEventListener("scroll", syncActiveTab)
      window.removeEventListener("resize", handleResize)
    }
  }, [items])

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-background/70 pl-1 pr-2 py-1 shadow-lg backdrop-blur-lg">
        {brandHref && brandLabel && (
          <Link
            href={brandHref}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary sm:px-4"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,255,0.8)]"
              aria-hidden="true"
            />
            <span className="hidden font-display text-base font-extrabold tracking-[-0.03em] sm:inline">
              {brandLabel}
            </span>
          </Link>
        )}

        <div className="flex items-center gap-0.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => {
                  if (!item.url.startsWith("#")) {
                    setActiveTab(item.name)
                    return
                  }

                  const id = item.url.slice(1)
                  const target = document.getElementById(id)

                  if (!target) {
                    setActiveTab(item.name)
                    return
                  }

                  event.preventDefault()
                  setActiveTab(item.name)
                  pendingScrollRef.current = {
                    element: target,
                    name: item.name,
                  }

                  if (pendingScrollTimeoutRef.current !== null) {
                    window.clearTimeout(pendingScrollTimeoutRef.current)
                  }

                  pendingScrollTimeoutRef.current = window.setTimeout(() => {
                    clearPendingScroll()
                  }, 1400)

                  window.history.replaceState(null, "", item.url)
                  target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }}
                className={cn(
                  "relative cursor-pointer rounded-full px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 -z-10 w-full rounded-full bg-primary/5"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                      <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                      <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                      <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>

        {dashHref && dashLabel && (
          <div className="shrink-0 rounded-full p-1">
            <Link
              href={dashHref}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 sm:px-5"
              style={{ background: 'linear-gradient(135deg, #4F46FF 0%, #00E5A0 100%)', boxShadow: '0 0 16px rgba(79,70,255,0.4)' }}
            >
              <span className="hidden sm:inline">{dashLabel}</span>
              <span className="sm:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </span>
            </Link>
          </div>
        )}
        {authHref && authLabel && (
          <div className="shrink-0 rounded-full pl-1 pr-0 py-1">
            <GradientButton
              asChild
              variant="variant"
              className="min-w-0 rounded-full px-4 py-2 text-sm sm:min-w-[7.5rem] sm:px-5 lg:min-w-[8rem] lg:px-6"
            >
              <Link href={authHref}>
                <span className="sm:inline">{authLabel}</span>
              </Link>
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  )
}
