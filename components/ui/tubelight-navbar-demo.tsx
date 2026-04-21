import {
  Briefcase,
  CreditCard,
  Home,
  LayoutPanelTop,
  Sparkles,
} from "lucide-react"

import { NavBar } from "@/components/ui/tubelight-navbar"

interface NavBarDemoProps {
  className?: string
}

export function NavBarDemo({ className }: NavBarDemoProps) {
  const navItems = [
    { name: "Overview", url: "#hero", icon: Home },
    {
      name: "Why Us",
      url: "#why-us",
      icon: Sparkles,
      matchIds: ["why-us"],
    },
    { name: "Features", url: "#features", icon: LayoutPanelTop },
    { name: "Product", url: "#product-showcase", icon: Briefcase },
    { name: "Pricing", url: "#pricing", icon: CreditCard },
  ]

  return (
    <NavBar
      items={navItems}
      className={className}
      brandHref="#hero"
      brandLabel="FlowDesk"
      dashHref="/dashboard"
      dashLabel="Go to Dashboard"
      authHref="/sign-in"
      authLabel="Sign In"
    />
  )
}
