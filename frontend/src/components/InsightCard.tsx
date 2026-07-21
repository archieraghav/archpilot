import { TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  id: string
  category: string
  severity: string
  title: string
  description: string
}

const categoryIcons: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  opportunity: Lightbulb,
  risk: ShieldAlert,
  summary: Info,
}

const severityStyles: Record<string, string> = {
  info: "border-blueprint/30 bg-blueprint/5",
  warning: "border-signal/40 bg-signal/5",
  critical: "border-red-500/40 bg-red-500/5",
}

const severityBadge: Record<string, string> = {
  info: "bg-blueprint/10 text-blueprint",
  warning: "bg-signal/10 text-signal",
  critical: "bg-red-500/10 text-red-500",
}

export function InsightCard({ category, severity, title, description }: Insight) {
  const Icon = categoryIcons[category] || Info

  return (
    <div className={cn("rounded-lg border p-5", severityStyles[severity] || "border-line dark:border-white/10")}>
      <div className="flex items-start justify-between">
        <Icon size={20} className="text-graphite" />
        <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide", severityBadge[severity] || "bg-graphite/10 text-graphite")}>
          {severity}
        </span>
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold">{title}</h3>
      <p className="mt-1 font-body text-sm text-graphite">{description}</p>
      <span className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wide text-graphite">
        {category}
      </span>
    </div>
  )
}