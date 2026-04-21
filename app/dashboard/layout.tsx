'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import {
  LayoutDashboard, TrendingUp, Brain, Shield, Activity,
  FileText, Settings, LogOut, Lock, ArrowRight, X, Bot,
  Database, Menu, Search, Sparkles, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { NotificationPopover } from '@/components/ui/notification-popover'
import { JeffChat } from '@/components/ui/jeff-chat'
import {
  type AppNotification,
  loadNotifications, saveNotifications,
  generateWeeklyNotification, generateModelNotifications,
  mergeNotifications,
} from '@/lib/notifications'
import type { TrainResult } from '@/lib/api'

// ── Route config ──────────────────────────────────────────────────────────────
const PRIMARY_ROUTES = [
  { label: 'Overview',  href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Agents',    href: '/dashboard/agents', icon: Bot },
  { label: 'Data',      href: '/dashboard/data',   icon: Database },
]

const ANALYTICS_ROUTES = [
  { label: 'Predictions',    href: '/dashboard/predictions',    icon: TrendingUp },
  { label: 'Explainability', href: '/dashboard/explainability', icon: Brain },
  { label: 'Fairness',       href: '/dashboard/fairness',       icon: Shield },
  { label: 'Model Health',   href: '/dashboard/health',         icon: Activity },
]

const MORE_ROUTES = [
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
]

const LOCKED_ROUTES = new Set([
  '/dashboard/predictions',
  '/dashboard/explainability',
  '/dashboard/fairness',
  '/dashboard/health',
  '/dashboard/reports',
])

// ── NavItem component ─────────────────────────────────────────────────────────
function SideNavItem({
  label, href, icon: Icon, isActive, isLocked, isCollapsed, onClick,
}: {
  label: string; href: string; icon: any
  isActive: boolean; isLocked: boolean; isCollapsed: boolean
  onClick?: () => void
}) {
  const content = (
    <motion.span
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      whileHover={!isLocked && !isActive ? { color: 'var(--color-text-secondary)' } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.12 }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: isCollapsed ? '9px 0' : '9px 12px',
        borderRadius: 8,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        color: isActive
          ? 'var(--color-accent-light)'
          : isLocked
          ? 'var(--color-text-muted)'
          : 'var(--color-text-muted)',
        opacity: isLocked ? 0.5 : 1,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        width: '100%',
        userSelect: 'none',
      }}
    >
      {/* Hover background */}
      {!isActive && !isLocked && (
        <motion.span
          style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
        />
      )}

      {/* Active background — layoutId makes it slide between items */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-bg"
          initial={false}
          style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            background: 'rgba(79,70,255,0.12)',
          }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Active left bar — layoutId makes it slide between items */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-bar"
          initial={false}
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(50% - 9px)',
            width: 3, height: 18,
            borderRadius: 2,
            background: 'var(--color-accent)',
            boxShadow: '4px 0 12px rgba(79,70,255,0.6)',
          }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, zIndex: 1 }}>
        <Icon
          size={16}
          style={{
            color: isActive ? 'var(--color-accent-light)' : 'inherit',
            strokeWidth: isActive ? 2.2 : 1.8,
            transition: 'stroke-width 0.15s, color 0.15s',
          }}
        />
        {isLocked && (
          <span style={{
            position: 'absolute', bottom: -3, right: -5,
            width: 11, height: 11,
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={6} color="var(--color-text-muted)" />
          </span>
        )}
      </span>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 13.5, fontWeight: isActive ? 600 : 500,
              flex: 1, whiteSpace: 'nowrap', zIndex: 1, position: 'relative',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  )

  return isLocked ? <div style={{ display: 'block' }}>{content}</div> : (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </Link>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, icon: Icon, collapsed }: { label: string; icon?: any; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 4px' }} />
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px 4px',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
    }}>
      {Icon && <Icon size={11} />}
      {label}
    </div>
  )
}


// ── Main layout ───────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [collapsed, setCollapsed] = useState(false)
  const [hasModel, setHasModel] = useState(false)
  const [modelId, setModelId] = useState<string | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const mid = localStorage.getItem('model_id')
    setModelId(mid)
    setHasModel(!!mid)

    let notifs = loadNotifications()
    const weekly = generateWeeklyNotification()
    if (weekly) notifs = mergeNotifications(notifs, [weekly])
    const raw = localStorage.getItem('train_result')
    if (raw) {
      try {
        const trainResult: TrainResult = JSON.parse(raw)
        notifs = mergeNotifications(notifs, generateModelNotifications(trainResult))
      } catch {}
    }
    saveNotifications(notifs)
    setNotifications(notifs)
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      setHasModel(!!localStorage.getItem('model_id'))
      const raw = localStorage.getItem('train_result')
      if (!raw) return
      try {
        const trainResult: TrainResult = JSON.parse(raw)
        setNotifications(prev => {
          const merged = mergeNotifications(prev, generateModelNotifications(trainResult))
          saveNotifications(merged)
          return merged
        })
      } catch {}
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!lockedMsg) return
    const t = setTimeout(() => setLockedMsg(null), 4000)
    return () => clearTimeout(t)
  }, [lockedMsg])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const displayName = user?.fullName ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'User'
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const plan = (user?.publicMetadata?.plan as string) ?? 'Growth Plan'
  const isOwner = user?.fullName === 'Gagan Saket Tellapati'

  const isRouteActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const handleNavClick = (href: string) => {
    const isLocked = !isOwner && !hasModel && LOCKED_ROUTES.has(href)
    if (isLocked) {
      const label = [...PRIMARY_ROUTES, ...ANALYTICS_ROUTES, ...MORE_ROUTES].find(r => r.href === href)?.label ?? href
      setLockedMsg(label)
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifications(next)
      return next
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      saveNotifications(next)
      return next
    })
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id)
      saveNotifications(next)
      return next
    })
  }

  const sidebarW = collapsed ? 64 : 224

  const renderNavGroup = (routes: typeof PRIMARY_ROUTES) =>
    routes.map(({ label, href, icon }) => {
      const locked = !isOwner && !hasModel && LOCKED_ROUTES.has(href)
      return (
        <SideNavItem
          key={href}
          label={label} href={href} icon={icon}
          isActive={isRouteActive(href)}
          isLocked={locked}
          isCollapsed={collapsed && !isMobile}
          onClick={locked ? () => handleNavClick(href) : undefined}
        />
      )
    })

  return (
    <div className="dash-root" style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 19, backdropFilter: 'blur(3px)' }}
          />
        )}
      </AnimatePresence>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: isMobile ? 224 : sidebarW,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        zIndex: 20,
        overflow: 'hidden',
        transition: isMobile
          ? 'transform 0.26s cubic-bezier(0.22,1,0.36,1)'
          : 'width 0.24s cubic-bezier(0.22,1,0.36,1)',
        animation: 'sidebar-enter 0.38s cubic-bezier(0.22,1,0.36,1) both',
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, height: '100%',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        } : {}),
      }}>

        {/* Logo */}
        <div style={{
          padding: '18px 14px 14px',
          display: 'flex', alignItems: 'center',
          justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {!(collapsed && !isMobile) && (
            <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#4F46FF',
                boxShadow: '0 0 10px rgba(79,70,255,0.8)',
                flexShrink: 0,
                display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}>
                FlowDesk
              </span>
            </Link>
          )}

          {/* Collapsed: just dot */}
          {(collapsed && !isMobile) && (
            <span
              onClick={() => setCollapsed(false)}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: '#4F46FF',
                boxShadow: '0 0 10px rgba(79,70,255,0.8)',
                display: 'inline-block',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          )}

          {/* Desktop collapse button */}
          {!isMobile && !(collapsed) && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 4, borderRadius: 5,
                display: 'flex', flexShrink: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              aria-label="Collapse sidebar"
            >
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
          <LayoutGroup id="sidebar-nav">
            {/* Primary routes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderNavGroup(PRIMARY_ROUTES)}
            </div>

            {/* Analytics section */}
            <div style={{ marginTop: 16 }}>
              <SectionLabel label="Analytics" icon={Sparkles} collapsed={collapsed && !isMobile} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                {renderNavGroup(ANALYTICS_ROUTES)}
              </div>
            </div>

            {/* More section */}
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '0 4px 12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {renderNavGroup(MORE_ROUTES)}
              </div>
            </div>
          </LayoutGroup>
        </div>

        {/* Bottom: settings + user */}
        <div style={{ padding: '10px 8px 14px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <Link
            href="/settings"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: (collapsed && !isMobile) ? '9px' : '9px 12px',
              borderRadius: 8, textDecoration: 'none',
              color: 'var(--color-text-muted)',
              justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
              transition: 'color 0.15s, background 0.15s',
              fontSize: 13.5,
              fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Settings size={15} strokeWidth={1.8} />
            {!(collapsed && !isMobile) && 'Settings'}
          </Link>

          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: (collapsed && !isMobile) ? '9px' : '9px 12px',
              borderRadius: 8, width: '100%',
              color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
              transition: 'color 0.15s, background 0.15s',
              fontSize: 13.5, fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF6B6B'; e.currentTarget.style.background = 'rgba(255,107,107,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={15} strokeWidth={1.8} />
            {!(collapsed && !isMobile) && 'Sign Out'}
          </button>

          {/* User card */}
          {!(collapsed && !isMobile) && (
            <div style={{
              marginTop: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl} alt={displayName}
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--color-border)' }}
                />
              ) : (
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#4F46FF,#00E5A0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{plan}</div>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {(collapsed && !isMobile) && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--color-border)' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46FF,#00E5A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {initials}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Topbar ── */}
        <header style={{
          height: 56,
          flexShrink: 0,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: isMobile ? '0 14px' : '0 20px',
          background: 'var(--color-bg-surface)',
          animation: 'topbar-enter 0.32s cubic-bezier(0.22,1,0.36,1) 0.04s both',
        }}>

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 5, borderRadius: 7, display: 'flex', flexShrink: 0 }}
            >
              <Menu size={18} />
            </button>
          )}

          {/* Search bar */}
          <div style={{
            flex: 1,
            maxWidth: isMobile ? '100%' : 440,
            margin: isMobile ? '0' : '0 auto',
            position: 'relative',
          }}>
            <Search
              size={14}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: searchFocused ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
                pointerEvents: 'none',
                transition: 'color 0.15s',
              }}
            />
            <input
              type="text"
              placeholder="Search projects, prompts, tools, anything..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                height: 34,
                background: searchFocused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${searchFocused ? 'rgba(79,70,255,0.4)' : 'var(--color-border)'}`,
                borderRadius: 8,
                paddingLeft: 34,
                paddingRight: 12,
                fontSize: 13,
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.15s, border-color 0.15s',
                boxShadow: searchFocused ? '0 0 0 3px rgba(79,70,255,0.1)' : 'none',
              }}
            />
          </div>

          {/* Right side: notification + user chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <NotificationPopover
              notifications={notifications}
              userEmail={userEmail}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDismiss={handleDismiss}
            />

            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '5px 10px 5px 6px',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,70,255,0.3)'; e.currentTarget.style.background = 'rgba(79,70,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={displayName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46FF,#00E5A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                    {initials}
                  </div>
                )}
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ── Locked tab banner ── */}
        <AnimatePresence>
          {lockedMsg && (
            <motion.div
              key="lock-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 20px',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-bg-elevated)',
              }}
            >
              <Lock size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>
                Train a model to unlock{' '}
                <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{lockedMsg}</strong>
              </span>
              <Link
                href="/dashboard/data"
                onClick={() => setLockedMsg(null)}
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  color: 'var(--color-accent-light)',
                  background: 'rgba(79,70,255,0.1)',
                  border: '1px solid rgba(79,70,255,0.22)',
                  borderRadius: 7, padding: '4px 10px',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.1)')}
              >
                Go to Data <ArrowRight size={10} />
              </Link>
              <button
                onClick={() => setLockedMsg(null)}
                style={{
                  flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', padding: 4, borderRadius: 5, display: 'flex',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page content ── */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile ? '20px 16px' : '28px 32px',
          background: 'var(--color-bg-base)',
        }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* ── Bono AI Chatbot ── */}
      <JeffChat modelId={modelId} />
    </div>
  )
}
