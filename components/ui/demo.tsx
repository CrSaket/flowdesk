"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs/legacy"
import { useUser } from "@clerk/nextjs"

import {
  authHeroImageSrc,
  sampleTestimonials,
} from "@/components/ui/auth-demo-data"
import { SignInPage } from "@/components/ui/sign-in"

export default function SignInPageDemo() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isSignedIn } = useUser()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard")
  }, [isSignedIn, router])

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || loading) return
    setError(null)
    setLoading(true)

    const fd = new FormData(event.currentTarget)
    const email = fd.get("email") as string
    const password = fd.get("password") as string

    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Sign-in requires additional verification. Please try again.")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? "Sign-in failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      const code = err.errors?.[0]?.code
      if (code === 'session_exists' || code === 'identifier_already_signed_in') {
        router.push("/dashboard")
        return
      }
      setError(err.errors?.[0]?.message ?? "Google sign-in failed.")
    }
  }

  const handleResetPassword = () => {
    router.push("/sign-in?mode=reset")
  }

  return (
    <div className="bg-background text-foreground">
      {error && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.4)",
          borderRadius: 8, padding: "10px 20px", fontSize: 13, color: "#FF6B6B",
          backdropFilter: "blur(8px)", whiteSpace: "nowrap",
        }}>
          {error}
        </div>
      )}
      <SignInPage
        title={
          <>
            Welcome back to <span className="text-primary">FlowDesk</span>
          </>
        }
        description={
          loading
            ? "Signing you in…"
            : "Sign in to review revenue health, automate ops, and keep every workflow moving."
        }
        heroImageSrc={authHeroImageSrc}
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={() => router.push("/create-account")}
        onBack={() => router.push("/")}
      />
    </div>
  )
}
