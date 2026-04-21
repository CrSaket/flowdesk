"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp, useClerk } from "@clerk/nextjs"

import {
  authHeroImageSrc,
  sampleTestimonials,
} from "@/components/ui/auth-demo-data"
import { CreateAccountPage } from "@/components/ui/create-account"

export default function CreateAccountPageDemo() {
  const router = useRouter()
  const { signUp, isLoaded } = useSignUp()
  const { setActive } = useClerk()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || loading) return
    setError(null)
    setLoading(true)

    const fd = new FormData(event.currentTarget)
    const fullName = (fd.get("fullName") as string).trim()
    const [firstName, ...rest] = fullName.split(" ")
    const lastName = rest.join(" ") || ""
    const email = fd.get("email") as string
    const password = fd.get("password") as string
    const confirmPassword = fd.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setVerifying(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? "Account creation failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded || codeLoading) return
    setCodeError(null)
    setCodeLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setCodeError("Verification incomplete. Please try again.")
      }
    } catch (err: any) {
      setCodeError(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? "Invalid verification code.")
    } finally {
      setCodeLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Google sign-up failed.")
    }
  }

  if (verifying) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--color-bg-base, #0a0a0f)", color: "#fff",
        flexDirection: "column", gap: 24, padding: 32,
      }}>
        <div style={{
          maxWidth: 400, width: "100%", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 40,
        }}>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg,#4F46FF,#00E5A0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }}>✉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              We sent a 6-digit verification code to your email address. Enter it below to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter verification code"
              maxLength={6}
              required
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 20,
                textAlign: "center", letterSpacing: "0.3em", fontWeight: 600,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", outline: "none", boxSizing: "border-box",
              }}
            />
            {codeError && (
              <p style={{ fontSize: 13, color: "#FF6B6B", textAlign: "center" }}>{codeError}</p>
            )}
            <button
              type="submit"
              disabled={codeLoading || code.length < 6}
              style={{
                padding: "14px", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer",
                background: "linear-gradient(135deg,#4F46FF,#00E5A0)", border: "none", color: "#fff",
                opacity: codeLoading || code.length < 6 ? 0.6 : 1,
              }}
            >
              {codeLoading ? "Verifying…" : "Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setVerifying(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    )
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
      <CreateAccountPage
        title={
          <>
            Start with <span className="text-primary">FlowDesk</span>
          </>
        }
        description={
          loading
            ? "Creating your account…"
            : "Create your account to centralize forecasting, automate reporting, and get your team moving in one place."
        }
        heroImageSrc={authHeroImageSrc}
        testimonials={sampleTestimonials}
        onCreateAccount={handleCreateAccount}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={() => router.push("/sign-in")}
        onBack={() => router.push("/")}
      />
    </div>
  )
}
