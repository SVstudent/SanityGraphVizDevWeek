import Link from "next/link"
import { TrendingUp, Zap, AlertTriangle, LineChart, Sparkles } from "lucide-react"
import { EntityBadge } from "@/components/entity-badge"
import { fetchAllInsights } from "@/lib/sanity"

export const revalidate = 60

const insightTypeConfig: Record<
  string,
  { icon: typeof TrendingUp; color: string; label: string }
> = {
  trend: {
    icon: TrendingUp,
    color: "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]",
    label: "Trend",
  },
  pattern: {
    icon: LineChart,
    color: "bg-[oklch(0.65_0.18_250/0.2)] text-[oklch(0.65_0.18_250)]",
    label: "Pattern",
  },
  anomaly: {
    icon: AlertTriangle,
    color: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]",
    label: "Anomaly",
  },
  prediction: {
    icon: Zap,
    color: "bg-[oklch(0.65_0.2_320/0.2)] text-[oklch(0.65_0.2_320)]",
    label: "Prediction",
  },
  recommendation: {
    icon: Sparkles,
    color: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]",
    label: "Recommendation",
  },
}

const impactColors: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)] border-[oklch(0.7_0.18_30/0.3)]",
  medium: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)] border-[oklch(0.75_0.15_50/0.3)]",
  low: "bg-secondary text-muted-foreground border-border",
}

export default async function InsightsPage() {
  const insights = await fetchAllInsights()

  // Group by impact level
  const criticalInsights = insights.filter((i: any) => i.impact === "critical")
  const highInsights = insights.filter((i: any) => i.impact === "high")
  const otherInsights = insights.filter(
    (i: any) => !["critical", "high"].includes(i.impact)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Trends, patterns, and predictions generated from your knowledge graph
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 flex flex-wrap gap-4">
        {Object.entries(insightTypeConfig).map(([type, config]) => {
          const count = insights.filter((i: any) => i.insightType === type).length
          const Icon = config.icon
          return (
            <div
              key={type}
              className={`flex items-center gap-2 rounded-lg border border-border px-4 py-2 ${config.color}`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{config.label}</span>
              <span className="ml-1 rounded-full bg-background/50 px-2 py-0.5 text-xs">
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Critical & High Impact Section */}
      {(criticalInsights.length > 0 || highInsights.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">High Priority</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[...criticalInsights, ...highInsights].map((insight: any) => {
              const config = insightTypeConfig[insight.insightType] || insightTypeConfig.trend
              const Icon = config.icon

              return (
                <Link
                  key={insight._id}
                  href={`/insights/${insight.slug?.current}`}
                  className={`group rounded-lg border p-6 transition-colors hover:border-accent/50 ${impactColors[insight.impact]}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium capitalize">
                        {insight.insightType}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${impactColors[insight.impact]}`}
                    >
                      {insight.impact}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">{insight.title}</h3>
                  <p className="mb-4 text-sm opacity-80 line-clamp-2">
                    {insight.summary}
                  </p>

                  {/* Confidence Bar */}
                  {insight.confidence && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-background/30">
                        <div
                          className="h-full rounded-full bg-current opacity-60"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  )}

                  {/* Related Entities */}
                  {insight.relatedEntities && insight.relatedEntities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {insight.relatedEntities.slice(0, 3).map((entity: any) => (
                        <EntityBadge
                          key={entity._id}
                          type={entity.entityType}
                          showLabel={false}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* All Insights */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">All Insights</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherInsights.map((insight: any) => {
            const config = insightTypeConfig[insight.insightType] || insightTypeConfig.trend
            const Icon = config.icon

            return (
              <Link
                key={insight._id}
                href={`/insights/${insight.slug?.current}`}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-1 ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                  {insight.impact && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${impactColors[insight.impact]}`}
                    >
                      {insight.impact}
                    </span>
                  )}
                </div>

                <h3 className="mb-2 font-semibold group-hover:text-accent">
                  {insight.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {insight.summary}
                </p>

                {/* Confidence */}
                {insight.confidence && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {insight.confidence}%
                    </span>
                  </div>
                )}

                {/* Data Points Preview */}
                {insight.dataPoints && insight.dataPoints.length > 0 && (
                  <div className="mt-4 flex items-end gap-1">
                    {insight.dataPoints.slice(0, 6).map((dp: any, i: number) => (
                      <div
                        key={i}
                        className="w-4 rounded-t bg-accent/50"
                        style={{
                          height: `${Math.max(8, (dp.value / 100) * 40)}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {insights.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No insights generated yet</p>
        </div>
      )}
    </div>
  )
}
