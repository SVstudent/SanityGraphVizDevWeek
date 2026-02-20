import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  TrendingUp,
  Zap,
  AlertTriangle,
  LineChart,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityBadge } from "@/components/entity-badge"
import { fetchInsightBySlug, fetchAllInsights } from "@/lib/sanity"

export const revalidate = 60

const insightTypeConfig: Record<
  string,
  { icon: typeof TrendingUp; color: string }
> = {
  trend: {
    icon: TrendingUp,
    color: "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]",
  },
  pattern: {
    icon: LineChart,
    color: "bg-[oklch(0.65_0.18_250/0.2)] text-[oklch(0.65_0.18_250)]",
  },
  anomaly: {
    icon: AlertTriangle,
    color: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]",
  },
  prediction: {
    icon: Zap,
    color: "bg-[oklch(0.65_0.2_320/0.2)] text-[oklch(0.65_0.2_320)]",
  },
  recommendation: {
    icon: Sparkles,
    color: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]",
  },
}

const impactColors: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]",
  medium: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]",
  low: "bg-secondary text-muted-foreground",
}

export async function generateStaticParams() {
  const insights = await fetchAllInsights()
  return insights.map((insight: any) => ({
    slug: insight.slug?.current,
  }))
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const insight = await fetchInsightBySlug(slug)

  if (!insight) {
    notFound()
  }

  const config = insightTypeConfig[insight.insightType] || insightTypeConfig.trend
  const Icon = config.icon

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/insights">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insights
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 rounded-lg border border-border bg-card p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${config.color}`}>
            <Icon className="h-5 w-5" />
            <span className="font-medium capitalize">{insight.insightType}</span>
          </div>
          {insight.impact && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium uppercase ${impactColors[insight.impact]}`}
            >
              {insight.impact} impact
            </span>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-bold">{insight.title}</h1>

        <p className="text-lg text-muted-foreground">{insight.summary}</p>

        {/* Metadata */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
          {insight.generatedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Generated: {new Date(insight.generatedAt).toLocaleDateString()}
            </div>
          )}
          {insight.validUntil && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Valid until: {new Date(insight.validUntil).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Confidence */}
        {insight.confidence && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-2xl font-bold">{insight.confidence}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Points Chart */}
      {insight.dataPoints && insight.dataPoints.length > 0 && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold">Data Trend</h2>
          <div className="flex h-48 items-end justify-around gap-4">
            {insight.dataPoints.map((dp: any, i: number) => {
              const maxValue = Math.max(...insight.dataPoints.map((d: any) => d.value))
              const height = (dp.value / maxValue) * 100

              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-accent transition-all hover:bg-accent/80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{dp.label}</span>
                  <span className="text-sm font-medium">{dp.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Related Entities */}
        {insight.relatedEntities && insight.relatedEntities.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Related Entities</h2>
            <div className="space-y-3">
              {insight.relatedEntities.map((entity: any) => (
                <Link
                  key={entity._id}
                  href={`/graph/${entity.slug?.current}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-accent/50 hover:bg-secondary/50"
                >
                  <EntityBadge type={entity.entityType} showLabel={false} size="sm" />
                  <span className="font-medium">{entity.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Content */}
        {insight.relatedContent && insight.relatedContent.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Related Content</h2>
            <div className="space-y-3">
              {insight.relatedContent.map((content: any) => (
                <Link
                  key={content._id}
                  href={`/content/${content.slug?.current}`}
                  className="block rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-accent/50 hover:bg-secondary/50"
                >
                  <span className="font-medium">{content.title}</span>
                  <span className="ml-2 text-xs capitalize text-muted-foreground">
                    {content.contentType}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
