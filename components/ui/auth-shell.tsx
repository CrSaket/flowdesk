"use client"

import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

interface GoogleButtonProps {
  label?: string
  onClick?: () => void
}

export interface Testimonial {
  avatarSrc: string
  name: string
  handle: string
  text: string
}

interface AuthPageShellProps {
  title: ReactNode
  description: ReactNode
  heroImageSrc?: string
  testimonials?: Testimonial[]
  children: ReactNode
  socialButton?: GoogleButtonProps
  footer: ReactNode
  onBack?: () => void
}

export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
)

export const GlassInputWrapper = ({
  children,
}: {
  children: ReactNode
}) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
)

export function AuthPageShell({
  title,
  description,
  children,
  socialButton,
  footer,
  onBack,
}: AuthPageShellProps) {
  return (
    <div className="font-geist flex min-h-[100dvh] w-[100dvw] flex-col bg-background text-foreground md:flex-row">
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {onBack && (
              <button
                onClick={onBack}
                className="animate-element animate-delay-100 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>
            )}
            <h1 className="animate-element animate-delay-100 font-display text-4xl font-semibold leading-[0.96] tracking-[-0.04em] md:text-5xl">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              {description}
            </p>

            {children}

            {socialButton && (
              <>
                <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                  <span className="w-full border-t border-border" />
                  <span className="absolute bg-background px-4 text-sm text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={socialButton.onClick}
                  className="animate-element animate-delay-800 flex w-full items-center justify-center gap-3 rounded-2xl border border-border py-4 transition-colors hover:bg-secondary"
                >
                  <GoogleIcon />
                  {socialButton.label ?? "Continue with Google"}
                </button>
              </>
            )}

            <div className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden flex-1 p-4 md:block">
        {/* Purple gradient panel */}
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 130% 90% at 75% 10%, rgba(79,70,255,0.92) 0%, transparent 52%),
              radial-gradient(ellipse 80% 60% at 15% 85%, rgba(0,229,160,0.18) 0%, transparent 50%),
              radial-gradient(ellipse 100% 70% at 50% 50%, #1a1060 0%, #09071A 100%)
            `,
          }}
        >
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }} />

          {/* Glow orb */}
          <div style={{
            position: 'absolute', top: '12%', right: '10%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,255,0.45) 0%, transparent 70%)',
            filter: 'blur(48px)', pointerEvents: 'none',
          }} />

          {/* Second softer orb */}
          <div style={{
            position: 'absolute', bottom: '20%', left: '5%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,116,255,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

        </div>
      </section>
    </div>
  )
}
