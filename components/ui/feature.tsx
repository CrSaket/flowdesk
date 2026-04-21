import type { ReactNode } from "react"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FeatureItem {
  title: string
  description: string
}

interface FeatureProps {
  badge?: string
  title?: string
  description?: string
  items?: FeatureItem[]
  visual?: ReactNode
  className?: string
}

function Feature({
  badge = "Platform",
  title = "Something new!",
  description = "Managing a small business today is already tough.",
  items = [
    {
      title: "Easy to use",
      description: "We've made it easy to use and understand.",
    },
    {
      title: "Fast and reliable",
      description: "We've made it fast and reliable.",
    },
    {
      title: "Beautiful and modern",
      description: "We've made it beautiful and modern.",
    },
  ],
  visual,
  className,
}: FeatureProps) {
  return (
    <div className={cn("w-full py-20 lg:py-28", className)}>
      <div className="mx-auto max-w-[1180px]">
        <div className="grid items-center gap-8 rounded-[28px] border border-border bg-card/30 p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:p-10">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary"
                >
                  {badge}
                </Badge>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="max-w-xl text-left font-[var(--font-display)] text-3xl font-bold tracking-tight text-foreground lg:text-5xl">
                  {title}
                </h2>
                <p className="max-w-xl text-left text-base leading-relaxed tracking-tight text-muted-foreground lg:text-lg">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:pl-4">
              {items.map((item) => (
                <div key={item.title} className="flex flex-row items-start gap-5">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground md:text-base">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-white/10 bg-muted/30 p-6">
            {visual || <div className="aspect-square w-full rounded-md bg-muted" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Feature }
