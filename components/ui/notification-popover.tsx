"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, Mail, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { AppNotification, NotifSeverity } from "@/lib/notifications";
import { markEmailedId, wasEmailed } from "@/lib/notifications";

// ── Severity config ───────────────────────────────────────────────────────────

const severityConfig: Record<NotifSeverity, { border: string; dot: string; badge: string; badgeText: string }> = {
  urgent:  { border: 'rgba(255,107,107,0.35)', dot: '#FF6B6B',  badge: 'rgba(255,107,107,0.12)', badgeText: '#FF6B6B'  },
  warning: { border: 'rgba(255,200,92,0.35)',  dot: '#FFC85C',  badge: 'rgba(255,200,92,0.12)',  badgeText: '#FFC85C'  },
  success: { border: 'rgba(0,229,160,0.3)',    dot: '#00E5A0',  badge: 'rgba(0,229,160,0.1)',    badgeText: '#00E5A0'  },
  info:    { border: 'rgba(79,70,255,0.3)',    dot: '#6E67FF',  badge: 'rgba(79,70,255,0.1)',    badgeText: '#6E67FF'  },
};

// ── Single notification item ──────────────────────────────────────────────────

interface NotificationItemProps {
  notification: AppNotification;
  index: number;
  userEmail: string | null;
  onMarkAsRead: (id: string) => void;
  onEmail: (n: AppNotification) => void;
  emailingId: string | null;
  emailedId: string | null;
}

const NotificationItem = ({
  notification: n,
  index,
  userEmail,
  onMarkAsRead,
  onEmail,
  emailingId,
  emailedId,
}: NotificationItemProps) => {
  const cfg = severityConfig[n.severity];
  const alreadyEmailed = wasEmailed(n.id) || emailedId === n.id;
  const isSendingEmail = emailingId === n.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.28, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        borderLeft: n.read ? '2px solid transparent' : `2px solid ${cfg.dot}`,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-overlay)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      onClick={() => onMarkAsRead(n.id)}
    >
      {/* Row 1: dot + title + timestamp */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, flex: 1, minWidth: 0 }}>
          {!n.read && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: cfg.dot,
              flexShrink: 0, marginTop: 5,
              boxShadow: `0 0 6px ${cfg.dot}`,
              animation: n.severity === 'urgent' ? 'notif-dot-pulse 1.5s ease-in-out infinite' : undefined,
            }} />
          )}
          <span style={{
            fontSize: 13, fontWeight: n.read ? 500 : 600,
            color: n.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            lineHeight: 1.35, flex: 1,
          }}>
            {n.title}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }}>
          {n.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Row 2: description */}
      <p style={{
        fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.55,
        margin: '5px 0 8px', paddingLeft: !n.read ? 13 : 0,
      }}>
        {n.description}
      </p>

      {/* Row 3: actions */}
      <div
        style={{ display: 'flex', gap: 6, paddingLeft: !n.read ? 13 : 0}}
        onClick={e => e.stopPropagation()}
      >
        {n.href && (
          <Link
            href={n.href}
            onClick={() => onMarkAsRead(n.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, color: 'var(--color-accent-light)', fontWeight: 600,
              textDecoration: 'none', padding: '3px 8px',
              background: cfg.badge, border: `1px solid ${cfg.border}`,
              borderRadius: 5, transition: 'opacity 0.15s',
            }}
          >
            View <ArrowRight size={10} />
          </Link>
        )}
        {n.emailable && userEmail && (
          <button
            onClick={() => onEmail(n)}
            disabled={alreadyEmailed || isSendingEmail}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600,
              color: alreadyEmailed ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
              padding: '3px 8px',
              background: alreadyEmailed ? 'transparent' : 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 5, cursor: alreadyEmailed ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {isSendingEmail
              ? <><span style={{ width: 8, height: 8, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'notif-spin 0.6s linear infinite' }} /> Sending…</>
              : alreadyEmailed
              ? <><Check size={10} /> Emailed</>
              : <><Mail size={10} /> Email me</>
            }
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface NotificationPopoverProps {
  notifications: AppNotification[];
  userEmail: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationPopover({
  notifications,
  userEmail,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationPopoverProps) {
  const [open, setOpen] = useState(false);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [emailedId, setEmailedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Track mount for portal (SSR safety)
  useEffect(() => { setMounted(true); }, []);

  // Measure the button position whenever we open
  const handleOpen = () => {
    if (!open && btnRef.current) {
      setAnchorRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(v => !v);
  };

  // Re-measure on scroll/resize while open so the panel tracks the button
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmail = async (n: AppNotification) => {
    if (!userEmail || emailingId || wasEmailed(n.id)) return;
    setEmailingId(n.id);
    try {
      const res = await fetch('/api/notify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: `FlowDesk Alert: ${n.title}`,
          title: n.title,
          description: n.description,
          href: n.href ?? '/dashboard',
          severity: n.severity,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        markEmailedId(n.id);
        setEmailedId(n.id);
        showToast(data.dev ? 'Email logged (configure SMTP to send real emails)' : `Alert emailed to ${userEmail}`);
      } else {
        showToast('Failed to send email. Check your SMTP config.');
      }
    } catch {
      showToast('Email send failed. Check your connection.');
    } finally {
      setEmailingId(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes notif-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes notif-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes notif-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div ref={ref} style={{ position: 'relative' }}>
        {/* Bell trigger */}
        <button
          ref={btnRef}
          onClick={handleOpen}
          aria-label="Notifications"
          style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--color-text-muted)',
            padding: 6, borderRadius: 8, display: 'flex',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'var(--color-bg-elevated)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Bell size={18} />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  position: 'absolute', top: 2, right: 2,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: '#FF6B6B',
                  border: '2px solid var(--color-bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff',
                  paddingInline: unread > 9 ? 3 : 0,
                }}
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Popover — rendered into document.body via portal to escape all stacking contexts */}
        {mounted && createPortal(
          <AnimatePresence>
          {open && anchorRect && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: anchorRect.bottom + 8,
                right: window.innerWidth - anchorRect.right,
                width: 360, maxHeight: 480,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,70,255,0.08)',
                overflow: 'hidden', zIndex: 99999,
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px 10px',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-bg-base)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Notifications</span>
                  {unread > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#FF6B6B',
                      background: 'rgba(255,107,107,0.12)',
                      border: '1px solid rgba(255,107,107,0.25)',
                      borderRadius: 4, padding: '1px 5px',
                    }}>
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    style={{
                      fontSize: 11, color: 'var(--color-accent-light)', fontWeight: 600,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '3px 6px', borderRadius: 5,
                      display: 'flex', alignItems: 'center', gap: 3,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Check size={11} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '32px 16px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <Bell size={24} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No notifications yet</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', opacity: 0.7 }}>
                      Train a model to get AI-powered alerts
                    </span>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      index={i}
                      userEmail={userEmail}
                      onMarkAsRead={onMarkAsRead}
                      onEmail={handleEmail}
                      emailingId={emailingId}
                      emailedId={emailedId}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              {userEmail && (
                <div style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--color-border)',
                  background: 'var(--color-bg-base)',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    Alerts for urgent notifications sent to <span style={{ color: 'var(--color-accent-light)' }}>{userEmail}</span>
                  </span>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', bottom: 88, right: 24,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 10, padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 9999, maxWidth: 320,
            }}
          >
            <Check size={14} style={{ color: '#00E5A0', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{toast}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, marginLeft: 4, display: 'flex' }}>
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
