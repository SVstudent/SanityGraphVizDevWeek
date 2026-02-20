import Link from "next/link"
import {
  Network,
  FileText,
  Lightbulb,
  ArrowRight,
  Users,
  Building2,
  Package,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { EntityBadge } from "@/components/entity-badge"
import { fetchDashboardStats, fetchEntities, fetchAllInsights, fetchAllRelationships, fetchAllContent, getRelationshipCount, getContentCount } from "@/lib/sanity"

export const revalidate = 60

export default async function DashboardPage() {
  const [stats, entities, insights, relationships, content, relCount, contentCount] = await Promise.all([
    fetchDashboardStats(),
    fetchEntities(),
    fetchAllInsights(),
    fetchAllRelationships(),
    fetchAllContent(),
    getRelationshipCount(),
    getContentCount(),
  ])

  // Group entities by type
  const entityCounts = entities.reduce(
    (acc: Record<string, number>, entity: { entityType: string }) => {
      acc[entity.entityType] = (acc[entity.entityType] || 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Content Intelligence Layer
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A knowledge graph powered by Sanity{"'"}s structured content. Traverse entity relationships, discover cross-referenced content, and surface AI-generated insights -- features only queryable, typed content makes possible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/graph">
                <Network className="mr-2 h-4 w-4" />
                Explore Graph
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/playground">
                Try Playground
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Entities"
            value={stats?.entityCount || entities.length}
            description="Nodes in your knowledge graph"
            icon={Users}
          />
          <StatCard
            title="Relationships"
            value={stats?.relationshipCount || relCount || relationships.length}
            description="Connections between entities"
            icon={Network}
          />
          <StatCard
            title="Content"
            value={stats?.contentCount || contentCount || content.length}
            description="Articles and documents"
            icon={FileText}
          />
          <StatCard
            title="Insights"
            value={stats?.insightCount || insights.length}
            description="AI-generated analysis"
            icon={Lightbulb}
          />
        </div>
      </section>

      {/* Entity Distribution */}
      <section className="mb-12">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold">Entity Distribution</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(entityCounts).map(([type, count]) => (
              <Link
                key={type}
                href={`/graph?type=${type}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <EntityBadge
                    type={type as any}
                    showLabel={false}
                    size="lg"
                  />
                  <span className="font-medium capitalize">{type}s</span>
                </div>
                <span className="text-2xl font-semibold text-muted-foreground group-hover:text-foreground">
                  {count as number}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Entities */}
        <section>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Entities</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/graph">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {entities.slice(0, 5).map((entity: any) => (
                <Link
                  key={entity._id}
                  href={`/graph/${entity.slug?.current}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <EntityBadge
                      type={entity.entityType}
                      showLabel={false}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">{entity.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {entity.description?.slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                  {entity.importance && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {entity.importance}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Insights */}
        <section>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest Insights</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/insights">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight: any) => (
                <Link
                  key={insight._id}
                  href={`/insights/${insight.slug?.current}`}
                  className="block rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        insight.impact === "critical"
                          ? "bg-destructive/20 text-destructive"
                          : insight.impact === "high"
                            ? "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {insight.impact || "medium"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {insight.insightType}
                    </span>
                  </div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {insight.summary}
                  </p>
                  {insight.confidence && (
                    <div className="mt-2 flex items-center gap-2">
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Feature Cards */}
      <section className="mt-12">
        <h2 className="mb-6 text-xl font-semibold">Explore StructureOS</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/graph"
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50"
          >
            <div className="mb-4 inline-flex rounded-lg bg-secondary p-3">
              <Network className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Graph Explorer</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your knowledge graph with interactive node-link diagrams.
              Explore relationships and connections between entities.
            </p>
          </Link>

          <Link
            href="/content"
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50"
          >
            <div className="mb-4 inline-flex rounded-lg bg-secondary p-3">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Content Library</h3>
            <p className="text-sm text-muted-foreground">
              Browse articles, research, and documents. See how content connects
              to entities in your knowledge graph.
            </p>
          </Link>

          <Link
            href="/insights"
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50"
          >
            <div className="mb-4 inline-flex rounded-lg bg-secondary p-3">
              <Lightbulb className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI Insights</h3>
            <p className="text-sm text-muted-foreground">
              Discover trends, patterns, and predictions generated from your
              knowledge graph data.
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
