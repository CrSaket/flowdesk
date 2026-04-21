"use client"

import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import {
  AuthPageShell,
  GlassInputWrapper,
  type Testimonial,
} from "@/components/ui/auth-shell"

interface CreateAccountPageProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heroImageSrc?: string
  testimonials?: Testimonial[]
  onCreateAccount?: (event: React.FormEvent<HTMLFormElement>) => void
  onGoogleSignUp?: () => void
  onSignIn?: () => void
  onBack?: () => void
}

export function CreateAccountPage({
  title = (
    <>
      Create your <span className="text-primary">FlowDesk</span> account
    </>
  ),
  description = "Set up your workspace, connect your numbers, and start running operations from one dashboard.",
  heroImageSrc,
  testimonials = [],
  onCreateAccount,
  onGoogleSignUp,
  onSignIn,
  onBack,
}: CreateAccountPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthPageShell
      title={title}
      description={description}
      heroImageSrc={heroImageSrc}
      testimonials={testimonials}
      onBack={onBack}
      socialButton={{
        label: "Create account with Google",
        onClick: onGoogleSignUp,
      }}
      footer={
        <>
          Already have an account?{" "}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onSignIn?.()
            }}
            className="text-violet-400 transition-colors hover:underline"
          >
            Sign In
          </a>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onCreateAccount}>
        <div className="animate-element animate-delay-300">
          <label className="text-sm font-medium text-muted-foreground">
            Full Name
          </label>
          <GlassInputWrapper>
            <input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">
            Work Email
          </label>
          <GlassInputWrapper>
            <input
              name="email"
              type="email"
              placeholder="Enter your work email"
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500">
          <label className="text-sm font-medium text-muted-foreground">
            Password
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

        <div className="animate-element animate-delay-600">
          <label className="text-sm font-medium text-muted-foreground">
            Confirm Password
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                )}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        <label className="animate-element animate-delay-700 flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="agreeToTerms" className="custom-checkbox" />
          <span className="text-foreground/90">
            I agree to the terms and privacy policy
          </span>
        </label>

        <button
          type="submit"
          className="animate-element animate-delay-800 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Account
        </button>
      </form>
    </AuthPageShell>
  )
}
