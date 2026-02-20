import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityBadge } from "@/components/entity-badge"
import { fetchContentBySlug, fetchAllContent, fetchRelatedContentBySharedEntities } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Share2, FileText } from "lucide-react"

export const revalidate = 60

const contentTypeColors: Record<string, string> = {
  article: "bg-[oklch(0.65_0.18_250/0.2)] text-[oklch(0.65_0.18_250)]",
  news: "bg-[oklch(0.7_0.18_30/0.2)] text-[oklch(0.7_0.18_30)]",
  research: "bg-[oklch(0.65_0.2_320/0.2)] text-[oklch(0.65_0.2_320)]",
  caseStudy: "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]",
  tutorial: "bg-[oklch(0.75_0.15_50/0.2)] text-[oklch(0.75_0.15_50)]",
  opinion: "bg-[oklch(0.7_0.12_200/0.2)] text-[oklch(0.7_0.12_200)]",
}

export async function generateStaticParams() {
  const content = await fetchAllContent()
  return content.map((item: any) => ({
    slug: item.slug?.current,
  }))
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = await fetchContentBySlug(slug)

  if (!content) {
    notFound()
  }

  // Fetch related content via shared entities -- this is a feature only structured content makes possible
  const entityIds = content.relatedEntities?.map((e: any) => e._id).filter(Boolean) || []
  const relatedContent = await fetchRelatedContentBySharedEntities(content._id, entityIds)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/content">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content
        </Link>
      </Button>

      {/* Article Header */}
      <article>
        <header className="mb-8">
          {/* Type & Sentiment */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                contentTypeColors[content.contentType] ||
                "bg-secondary text-muted-foreground"
              }`}
            >
              {content.contentType?.replace(/([A-Z])/g, " $1").trim() || "Article"}
            </span>
            {content.sentiment !== undefined && (
              <span
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  content.sentiment > 0.3
                    ? "bg-[oklch(0.7_0.15_145/0.2)] text-[oklch(0.7_0.15_145)]"
                    : content.sentiment < -0.3
                      ? "bg-destructive/20 text-destructive"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                Sentiment:{" "}
                {content.sentiment > 0
                  ? `+${content.sentiment.toFixed(2)}`
                  : content.sentiment.toFixed(2)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {content.title}
          </h1>

          {/* Excerpt */}
          {content.excerpt && (
            <p className="mb-6 text-xl text-muted-foreground">{content.excerpt}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {content.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {content.author}
              </div>
            )}
            {content.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(content.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            {content.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {content.readingTime} min read
              </div>
            )}
            {content.sourceUrl && (
              <a
                href={content.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Source
              </a>
            )}
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {content.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Body Content */}
        <div className="prose prose-invert max-w-none">
          {content.body && content.body.length > 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-accent [&_a]:underline [&_strong]:font-bold [&_em]:italic">
              <PortableText value={content.body} />
            </div>
          ) : content.excerpt ? (
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-lg leading-relaxed text-foreground/90">{content.excerpt}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Full article content is not yet available for this piece.
              </p>
            </div>
          )}
        </div>

        {/* Related Entities */}
        {content.relatedEntities && content.relatedEntities.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Related Entities</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.relatedEntities.map((entity: any) => (
                <Link
                  key={entity._id}
                  href={`/graph/${entity.slug?.current}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/50"
                >
                  <EntityBadge type={entity.entityType} showLabel={false} size="md" />
                  <div>
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {entity.entityType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* Related Content via Shared Entities -- structured content feature */}
        {relatedContent.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Discovered via Shared Entities</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Content that shares knowledge graph entities with this article -- a connection only structured, queryable content can surface.
            </p>
            <div className="space-y-3">
              {relatedContent.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/content/${item.slug?.current}`}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                          contentTypeColors[item.contentType] ||
                          "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {item.contentType}
                      </span>
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        {item.sharedEntityCount} shared {item.sharedEntityCount === 1 ? "entity" : "entities"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-medium group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                    {item.relatedEntities && item.relatedEntities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.relatedEntities.slice(0, 4).map((e: any) => (
                          <span
                            key={e._id}
                            className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-xs"
                          >
                            <EntityBadge type={e.entityType} showLabel={false} size="sm" />
                            {e.name}
                          </span>
                        ))}
                        {item.relatedEntities.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{item.relatedEntities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
