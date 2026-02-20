"use client"

import { useState } from "react"
import { Play, Copy, Check, Code2, Database, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const exampleQueries = [
  {
    name: "All Entities",
    description: "Fetch all entities ordered by importance",
    query: `*[_type == "entity"] | order(importance desc) {
  _id,
  name,
  entityType,
  importance,
  description
}`,
  },
  {
    name: "Entity Relationships",
    description: "Get relationships with expanded source and target",
    query: `*[_type == "relationship"] {
  _id,
  relationshipType,
  strength,
  "source": source->{name, entityType},
  "target": target->{name, entityType}
}`,
  },
  {
    name: "High Impact Insights",
    description: "Find critical and high impact insights",
    query: `*[_type == "insight" && impact in ["critical", "high"]] {
  _id,
  title,
  insightType,
  impact,
  confidence,
  summary
} | order(confidence desc)`,
  },
  {
    name: "Content with Entities",
    description: "Get content with related entity references",
    query: `*[_type == "content"] {
  _id,
  title,
  contentType,
  publishedAt,
  "entities": relatedEntities[]->{name, entityType}
} | order(publishedAt desc)`,
  },
  {
    name: "Dashboard Stats",
    description: "Get aggregate counts for dashboard",
    query: `{
  "entities": count(*[_type == "entity"]),
  "relationships": count(*[_type == "relationship"]),
  "content": count(*[_type == "content"]),
  "insights": count(*[_type == "insight"])
}`,
  },
]

export default function PlaygroundPage() {
  const [query, setQuery] = useState(exampleQueries[0].query)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runQuery = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error("Query failed")
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">GROQ Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Experiment with GROQ queries against your Sanity knowledge graph
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">GROQ Query</span>
              </div>
              <Button onClick={runQuery} disabled={loading} size="sm">
                <Play className="mr-2 h-4 w-4" />
                {loading ? "Running..." : "Run Query"}
              </Button>
            </div>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[200px] resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
              placeholder="Enter your GROQ query..."
            />
          </div>

          {/* Results */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Results</span>
              </div>
              {result && (
                <Button variant="ghost" size="sm" onClick={copyResult}>
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
            <div className="max-h-[400px] overflow-auto p-4">
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : result ? (
                <pre className="text-sm text-muted-foreground">
                  <code>{result}</code>
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run a query to see results
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Example Queries */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="font-medium">Example Queries</span>
            </div>
            <div className="space-y-2">
              {exampleQueries.map((example) => (
                <button
                  key={example.name}
                  onClick={() => setQuery(example.query)}
                  className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-left transition-colors hover:border-accent/50 hover:bg-secondary/50"
                >
                  <p className="font-medium">{example.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {example.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* GROQ Tips */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 font-medium">GROQ Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-secondary px-1">*[_type == ""]</code> - Query by document type
              </li>
              <li>
                <code className="rounded bg-secondary px-1">-{">"}</code> - Dereference a reference
              </li>
              <li>
                <code className="rounded bg-secondary px-1">| order()</code> - Sort results
              </li>
              <li>
                <code className="rounded bg-secondary px-1">[0...10]</code> - Slice results
              </li>
              <li>
                <code className="rounded bg-secondary px-1">count()</code> - Count documents
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
