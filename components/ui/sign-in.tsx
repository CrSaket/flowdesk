"use client"

import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import {
  AuthPageShell,
  GlassInputWrapper,
  type Testimonial,
} from "@/components/ui/auth-shell"
import { GradientButton } from "@/components/ui/gradient-button"

interface SignInPageProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heroImageSrc?: string
  testimonials?: Testimonial[]
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void
  onGoogleSignIn?: () => void
  onResetPassword?: () => void
  onCreateAccount?: () => void
  onBack?: () => void
}

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <>
      Welcome back to <span className="text-primary">FlowDesk</span>
    </>
  ),
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onBack,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthPageShell
      title={title}
      description={description}
      heroImageSrc={heroImageSrc}
      testimonials={testimonials}
      onBack={onBack}
      socialButton={{
        label: "Continue with Google",
        onClick: onGoogleSignIn,
      }}
      footer={
        <>
          New to our platform?{" "}
          <Link
            href="/create-account"
            onClick={() => onCreateAccount?.()}
            className="text-violet-400 transition-colors hover:underline"
          >
            Create Account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSignIn}>
        <div className="animate-element animate-delay-300">
          <label className="text-sm font-medium text-muted-foreground">
            Email Address
          </label>
          <GlassInputWrapper>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">
            Password
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                )}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="rememberMe" className="custom-checkbox" />
            <span className="text-foreground/90">Keep me signed in</span>
          </label>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onResetPassword?.()
            }}
            className="text-violet-400 transition-colors hover:underline"
          >
            Reset password
          </a>
        </div>

        <GradientButton
          type="submit"
          className="animate-element animate-delay-600 w-full"
        >
          Sign In
        </GradientButton>
      </form>
    </AuthPageShell>
  )
}
