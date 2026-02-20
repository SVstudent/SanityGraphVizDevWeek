import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Calendar, MapPin, Building, FileText, Lightbulb, Network, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityBadge, getEntityColor } from "@/components/entity-badge"
import {
  fetchEntityBySlug,
  fetchEntityRelationships,
  fetchEntities,
  fetchAllRelationships,
  fetchContentByEntity,
  fetchInsightsByEntity,
  fetchSecondDegreeConnections,
} from "@/lib/sanity"
import { GraphVisualization } from "@/components/graph-visualization"

export const revalidate = 60

export async function generateStaticParams() {
  const entities = await fetchEntities()
  return entities.map((entity: any) => ({
    slug: entity.slug?.current,
  }))
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entity = await fetchEntityBySlug(slug)

  if (!entity) {
    notFound()
  }

  const [relationships, allEntities, allRelationships, entityContent, entityInsights, secondDegree] = await Promise.all([
    fetchEntityRelationships(entity._id),
    fetchEntities(),
    fetchAllRelationships(),
    fetchContentByEntity(entity._id),
    fetchInsightsByEntity(entity._id),
    fetchSecondDegreeConnections(entity._id),
  ])

  // Get related entity IDs from relationships
  const relatedEntityIds = new Set<string>()
  relationships.forEach((rel: any) => {
    if (rel.source?._id) relatedEntityIds.add(rel.source._id)
    if (rel.target?._id) relatedEntityIds.add(rel.target._id)
  })

  // Filter to show only the entity and its immediate connections
  const graphEntities = allEntities.filter(
    (e: any) =>
      e._id === entity._id ||
      relatedEntityIds.has(e._id) ||
      e._id.includes(entity._id.replace("drafts.", ""))
  )

  const graphRelationships = allRelationships.filter(
    (r: any) =>
      r.source?._id?.includes(entity._id.replace("drafts.", "")) ||
      r.target?._id?.includes(entity._id.replace("drafts.", ""))
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/graph">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Graph
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entity Header */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold"
                style={{
                  backgroundColor: `${getEntityColor(entity.entityType)}20`,
                  color: getEntityColor(entity.entityType),
                }}
              >
                {entity.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{entity.name}</h1>
                  <EntityBadge type={entity.entityType} />
                </div>
                {entity.description && (
                  <p className="mt-2 text-muted-foreground">
                    {entity.description}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            {entity.metadata && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {entity.metadata.foundedDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Founded:</span>
                    <span>
                      {new Date(entity.metadata.foundedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {entity.metadata.headquarters && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">HQ:</span>
                    <span>{entity.metadata.headquarters}</span>
                  </div>
                )}
                {entity.metadata.industry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Industry:</span>
                    <span>{entity.metadata.industry}</span>
                  </div>
                )}
                {entity.metadata.website && (
                  <a
                    href={entity.metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {entity.metadata.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            )}

            {/* Tags */}
            {entity.tags && entity.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {entity.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-md bg-secondary px-2.5 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Aliases */}
            {entity.aliases && entity.aliases.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  Also known as:{" "}
                </span>
                <span className="text-sm">{entity.aliases.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Relationship Graph</h2>
            <GraphVisualization
              entities={graphEntities}
              relationships={graphRelationships}
              focusEntityId={entity._id}
            />
          </div>

          {/* Entity Impact Analysis -- structured content feature */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Impact Analysis</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Structured content enables tracing how this entity connects across content, insights, and second-degree relationships -- something flat content cannot do.
            </p>

            {/* Impact summary stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-2xl font-bold text-accent">{entityContent.length}</div>
                <div className="text-xs text-muted-foreground">Content Pieces</div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-2xl font-bold text-accent">{entityInsights.length}</div>
                <div className="text-xs text-muted-foreground">Insights</div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-2xl font-bold text-accent">
                  {secondDegree.secondDegree?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">2nd-Degree Links</div>
              </div>
            </div>

            {/* Content referencing this entity */}
            {entityContent.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Content Referencing This Entity
                </h3>
                <div className="space-y-2">
                  {entityContent.slice(0, 5).map((item: any) => (
                    <Link
                      key={item._id}
                      href={`/content/${item.slug?.current}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:border-accent/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium group-hover:text-accent transition-colors">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs capitalize text-muted-foreground">
                            {item.contentType}
                          </span>
                          {item.publishedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {entityContent.length > 5 && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      +{entityContent.length - 5} more content pieces reference this entity
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Insights referencing this entity */}
            {entityInsights.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  Insights Involving This Entity
                </h3>
                <div className="space-y-2">
                  {entityInsights.slice(0, 5).map((item: any) => (
                    <Link
                      key={item._id}
                      href={`/insights/${item.slug?.current}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:border-accent/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium group-hover:text-accent transition-colors">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${
                            item.impact === 'critical' ? 'bg-destructive/20 text-destructive' :
                            item.impact === 'high' ? 'bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {item.impact || item.insightType}
                          </span>
                          {item.confidence && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {entityInsights.length > 5 && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      +{entityInsights.length - 5} more insights involve this entity
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Second-degree connections */}
            {secondDegree.secondDegree && secondDegree.secondDegree.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Network className="h-4 w-4" />
                  Second-Degree Connections
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Entities connected through intermediaries -- discovered by traversing typed references in the knowledge graph.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const seen = new Set<string>()
                    const uniqueEntities: any[] = []
                    secondDegree.secondDegree.forEach((rel: any) => {
                      if (rel.source && !seen.has(rel.source._id) && rel.source._id !== entity._id) {
                        seen.add(rel.source._id)
                        uniqueEntities.push(rel.source)
                      }
                      if (rel.target && !seen.has(rel.target._id) && rel.target._id !== entity._id) {
                        seen.add(rel.target._id)
                        uniqueEntities.push(rel.target)
                      }
                    })
                    return uniqueEntities.slice(0, 12).map((e: any) => (
                      <Link
                        key={e._id}
                        href={`/graph/${e.slug?.current}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-sm transition-colors hover:border-accent/50 hover:bg-secondary/50"
                      >
                        <EntityBadge type={e.entityType} showLabel={false} size="sm" />
                        {e.name}
                      </Link>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* Empty state */}
            {entityContent.length === 0 && entityInsights.length === 0 && (!secondDegree.secondDegree || secondDegree.secondDegree.length === 0) && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No cross-references found yet. As more content and insights are added to the knowledge graph, impact connections will appear here.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Importance Score</span>
                <span className="font-medium">{entity.importance || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Direct Connections</span>
                <span className="font-medium">{relationships.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Content References</span>
                <span className="font-medium">{entityContent.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Insight References</span>
                <span className="font-medium">{entityInsights.length}</span>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Relationships</h2>
            {relationships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No relationships found
              </p>
            ) : (
              <div className="space-y-3">
                {relationships.map((rel: any) => {
                  const isSource = rel.source?._id?.includes(
                    entity._id.replace("drafts.", "")
                  )
                  const relatedEntity = isSource ? rel.target : rel.source
                  const direction = isSource ? "outgoing" : "incoming"

                  return (
                    <Link
                      key={rel._id}
                      href={`/graph/${relatedEntity?.slug?.current}`}
                      className="block rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-accent/50 hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-2">
                        {relatedEntity && (
                          <EntityBadge
                            type={relatedEntity.entityType}
                            showLabel={false}
                            size="sm"
                          />
                        )}
                        <span className="font-medium">
                          {relatedEntity?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={`rounded px-1.5 py-0.5 ${
                            direction === "outgoing"
                              ? "bg-accent/20 text-accent"
                              : "bg-secondary"
                          }`}
                        >
                          {direction}
                        </span>
                        <span className="capitalize">
                          {rel.relationshipType.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        {rel.strength && (
                          <span className="ml-auto">{rel.strength}%</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
