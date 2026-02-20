import { Suspense } from "react"
import Link from "next/link"
import { Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EntityBadge, getEntityColor } from "@/components/entity-badge"
import { fetchEntities, fetchAllRelationships } from "@/lib/sanity"
import { GraphVisualization } from "@/components/graph-visualization"

export const revalidate = 60

interface GraphPageProps {
  searchParams: Promise<{ types?: string; q?: string }>
}

export default async function GraphPage({ searchParams }: GraphPageProps) {
  const params = await searchParams
  const typesParam = params.types
  const q = params.q

  // Parse comma-separated types into array
  const selectedTypes = typesParam ? typesParam.split(",").filter(Boolean) : []

  // Fetch all entities (we'll filter client-side for multi-select)
  const [allEntities, relationships] = await Promise.all([
    fetchEntities(),
    fetchAllRelationships(),
  ])

  // Filter entities by selected types (if any)
  let entities = selectedTypes.length > 0
    ? allEntities.filter((e) => selectedTypes.includes(e.entityType))
    : allEntities

  // Filter entities by search query if provided
  const filteredEntities = q
    ? entities.filter(
        (e) =>
          e.name.toLowerCase().includes(q.toLowerCase()) ||
          e.description?.toLowerCase().includes(q.toLowerCase())
      )
    : entities

  const entityTypes = [
    "person",
    "organization",
    "product",
    "place",
    "concept",
    "topic",
  ] as const

  // Color mapping for entity types
  const entityColors: Record<string, string> = {
    person: "oklch(0.7 0.18 250)",
    organization: "oklch(0.7 0.15 145)",
    product: "oklch(0.75 0.15 50)",
    place: "oklch(0.7 0.12 200)",
    concept: "oklch(0.65 0.15 280)",
    topic: "oklch(0.65 0.2 320)",
  }

  // Helper to generate URL with toggled type
  function getTypeToggleUrl(typeItem: string): string {
    const newTypes = selectedTypes.includes(typeItem)
      ? selectedTypes.filter((t) => t !== typeItem)
      : [...selectedTypes, typeItem]
    
    const params = new URLSearchParams()
    if (newTypes.length > 0) {
      params.set("types", newTypes.join(","))
    }
    if (q) {
      params.set("q", q)
    }
    const queryString = params.toString()
    return `/graph${queryString ? `?${queryString}` : ""}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Graph Explorer</h1>
        <p className="mt-2 text-muted-foreground">
          Explore entities and their relationships in your knowledge graph
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/graph?q=${q}` : "/graph"}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTypes.length === 0
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </Link>
          {entityTypes.map((typeItem) => {
            const isSelected = selectedTypes.includes(typeItem)
            const color = entityColors[typeItem]
            return (
              <Link
                key={typeItem}
                href={getTypeToggleUrl(typeItem)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  isSelected
                    ? "text-white border-2"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  backgroundColor: isSelected ? `color-mix(in oklch, ${color} 20%)` : undefined,
                  borderColor: isSelected ? color : undefined,
                  color: isSelected ? color : undefined,
                }}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                {typeItem}s
              </Link>
            )
          })}
        </div>
        <form className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search entities..."
            defaultValue={q}
            className="pl-9"
          />
          {selectedTypes.length > 0 && (
            <input type="hidden" name="types" value={selectedTypes.join(",")} />
          )}
        </form>
      </div>

      {/* Graph Visualization */}
      <div className="mb-8">
        <Suspense
          fallback={
            <div className="flex h-[500px] items-center justify-center rounded-lg border border-border bg-card">
              <p className="text-muted-foreground">Loading graph...</p>
            </div>
          }
        >
          <GraphVisualization
            entities={filteredEntities}
            relationships={relationships}
          />
        </Suspense>
      </div>

      {/* Entity List */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Entities ({filteredEntities.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntities.map((entity: any) => (
            <Link
              key={entity._id}
              href={`/graph/${entity.slug?.current}`}
              className="group rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <EntityBadge type={entity.entityType} size="sm" />
                {entity.importance && (
                  <span className="text-sm text-muted-foreground">
                    {entity.importance}
                  </span>
                )}
              </div>
              <h3 className="font-medium group-hover:text-accent">
                {entity.name}
              </h3>
              {entity.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {entity.description}
                </p>
              )}
              {entity.tags && entity.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entity.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
