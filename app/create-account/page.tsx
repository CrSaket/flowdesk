import type { Metadata } from "next"

import CreateAccountPageDemo from "@/components/ui/create-account-demo"

export const metadata: Metadata = {
  title: "Create Account | FlowDesk",
  description:
    "Create a FlowDesk account to centralize forecasting, automate reporting, and run operations from one dashboard.",
}

export default function CreateAccount() {
  return <CreateAccountPageDemo />
}
