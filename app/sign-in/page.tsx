import type { Metadata } from "next"

import SignInPageDemo from "@/components/ui/demo"

export const metadata: Metadata = {
  title: "Sign In | FlowDesk",
  description:
    "Access your FlowDesk workspace, review performance, and continue where you left off.",
}

export default function SignIn() {
  return <SignInPageDemo />
}
