import Link from "next/link"
import { Calendar, Clock, User, Tag } from "lucide-react"
import { EntityBadge } from "@/components/entity-badge"
import { fetchAllContent } from "@/lib/sanity"

export const revalidate = 60

const contentTypeColors: Record<string, string> = {
  article: "bg-[oklch(0.65_0.18_250/0.2)] text-[oklch(0.65_0.18_250)]",
  news: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]",
  research: "bg-[oklch(0.65_0.2_320/0.2)] text-[oklch(0.65_0.2_320)]",
  caseStudy: "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]",
  tutorial: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]",
  opinion: "bg-[oklch(0.7_0.12_200/0.2)] text-[oklch(0.7_0.12_200)]",
}

export default async function ContentPage() {
  const content = await fetchAllContent()

  // Group content by type
  const contentByType = content.reduce((acc: Record<string, any[]>, item: any) => {
    const type = item.contentType || "article"
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
        <p className="mt-2 text-muted-foreground">
          Browse articles, research, and documents connected to your knowledge graph
        </p>
      </div>

      {/* Content Type Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
          All ({content.length})
        </span>
        {Object.entries(contentByType).map(([type, items]) => (
          <span
            key={type}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${contentTypeColors[type] || "bg-secondary text-muted-foreground"}`}
          >
            {type.replace(/([A-Z])/g, " $1").trim()} ({(items as any[]).length})
          </span>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.map((item: any) => (
          <Link
            key={item._id}
            href={`/content/${item.slug?.current}`}
            className="group flex flex-col rounded-lg border border-border bg-card transition-colors hover:border-accent/50"
          >
            <div className="flex-1 p-6">
              {/* Type Badge */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${contentTypeColors[item.contentType] || "bg-secondary text-muted-foreground"}`}
                >
                  {item.contentType?.replace(/([A-Z])/g, " $1").trim() || "Article"}
                </span>
                {item.sentiment !== undefined && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      item.sentiment > 0.3
                        ? "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]"
                        : item.sentiment < -0.3
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {item.sentiment > 0.3
                      ? "Positive"
                      : item.sentiment < -0.3
                        ? "Negative"
                        : "Neutral"}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="mb-2 text-lg font-semibold group-hover:text-accent">
                {item.title}
              </h2>

              {/* Excerpt */}
              {item.excerpt && (
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {item.excerpt}
                </p>
              )}

              {/* Related Entities */}
              {item.relatedEntities && item.relatedEntities.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {item.relatedEntities.slice(0, 3).map((entity: any) => (
                    <EntityBadge
                      key={entity._id}
                      type={entity.entityType}
                      showLabel={false}
                      size="sm"
                    />
                  ))}
                  {item.relatedEntities.length > 3 && (
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                      +{item.relatedEntities.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.author && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </span>
                )}
                {item.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {item.readingTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.readingTime} min
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {content.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No content found</p>
        </div>
      )}
    </div>
  )
}
