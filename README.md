# StructureOS -- Content Intelligence Layer

A knowledge graph platform that demonstrates features **only structured, queryable content can power** -- built on [Sanity](https://www.sanity.io/) and [GROQ](https://www.sanity.io/docs/groq).

**Built by [Sathvik Vempati](https://github.com/SVstudent)**

---

## What Is This?

StructureOS models content as a **knowledge graph** rather than flat files. Every entity (person, organization, technology, concept, event, location) is a typed Sanity document. Relationships between entities are first-class documents with typed `source`/`target` references. Content pieces and AI-generated insights reference entities through Sanity's reference system.

This architecture enables features that flat content (markdown, WordPress, static HTML) **cannot replicate**.

---

## Features Only Structured Content Makes Possible

### 1. Entity Impact Analysis

For any entity in the knowledge graph, instantly see:

- Every **content piece** that references it (via `references()` GROQ function)
- Every **AI-generated insight** that involves it
- **Second-degree connections** -- entities connected through intermediaries (two-hop traversal of relationship documents)

**Why it requires structured content:** Uses Sanity's `references()` for reverse-reference lookups across document types. Flat content has no reference system to traverse.

### 2. Cross-Entity Content Discovery

When viewing an article, the system finds related content that **shares knowledge graph entities**:

- Performs a GROQ join across `relatedEntities` reference arrays
- Counts overlapping entity IDs between documents
- Ranks results by shared entity count

**Why it requires structured content:** This is a structural join across typed reference arrays -- not keyword matching.

### 3. Second-Degree Connection Graph

Starting from any entity, traverse two hops of relationship documents to discover entities connected through intermediaries.

**Why it requires structured content:** Relationships are first-class Sanity documents with typed `source` and `target` reference fields, enabling graph traversal queries in GROQ.

---

## All Features

| Feature | Description |
|---|---|
| **Knowledge Graph Visualization** | Interactive D3.js force-directed graph with color-coded entity types, importance-based sizing, hover/click interaction, and type filtering |
| **Entity Impact Analysis** | Reverse-reference lookups + second-degree traversal for any entity |
| **Cross-Entity Content Discovery** | GROQ join across reference arrays to find structurally related content |
| **Content Explorer** | Browse, filter, and read content with Portable Text rendering |
| **Insights Engine** | AI-generated insights stored as structured documents with confidence scores and entity references |
| **AI Playground** | Groq LLM-powered chat for natural language queries over the knowledge graph |
| **Real-Time Dashboard** | Live GROQ-powered statistics for entities, relationships, content, and insights |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Content Backend** | [Sanity](https://www.sanity.io/) -- structured content with typed references |
| **Query Language** | [GROQ](https://www.sanity.io/docs/groq) -- 15+ queries including `references()`, array comprehensions, nested projections |
| **Dev Tooling** | [Sanity MCP Server](https://www.sanity.io/docs/mcp-server) -- schema exploration and query scaffolding |
| **Framework** | [Next.js 16](https://nextjs.org/) -- App Router, React Server Components |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **Graph Visualization** | [D3.js](https://d3js.org/) -- force simulation |
| **Rich Text** | [@portabletext/react](https://github.com/portabletext/react-portabletext) |
| **AI** | [Groq](https://groq.com/) LLM via API route |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Sanity Schema Architecture

```
entity
  - name, slug, entityType, description, importance
  - entityType: person | organization | technology | concept | event | location

relationship
  - source -> entity (typed reference)
  - target -> entity (typed reference)
  - relationshipType, strength, description

content / contentNode
  - title, slug, contentType, body (Portable Text), excerpt
  - relatedEntities[] -> entity (typed reference array)
  - sentiment, readingTime, publishedAt

insight
  - title, slug, insightType, summary, body
  - relatedEntities[] -> entity (typed reference array)
  - confidence, impact, generatedAt
```

---

## Key GROQ Queries

**Reverse-reference lookup (Impact Analysis):**
```groq
*[_type in ["content", "contentNode"] && references($entityId)]
```

**Cross-entity content discovery:**
```groq
*[_type in ["content", "contentNode"] && _id != $contentId
  && count((relatedEntities[]._ref)[@ in $entityIds]) > 0]
  | order(publishedAt desc)
  { ..., "sharedEntityCount": count((relatedEntities[]._ref)[@ in $entityIds]) }
```

**Second-degree connection traversal:**
```groq
{
  "firstDegree": *[_type == "relationship"
    && (source._ref == $entityId || target._ref == $entityId)],
  "secondDegree": *[_type == "relationship"
    && (source._ref in $firstDegreeIds || target._ref in $firstDegreeIds)
    && source._ref != $entityId && target._ref != $entityId]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Sanity project with the schema described above
- Groq API key (for the AI playground)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_TOKEN=your_sanity_token
GROQ_API_KEY=your_groq_api_key
```

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                    # Dashboard with live stats
  about/page.tsx              # Architecture + structured content features
  content/
    page.tsx                  # Content explorer with filtering
    [slug]/page.tsx           # Content detail + cross-entity discovery
  graph/
    page.tsx                  # Knowledge graph visualization
    [slug]/page.tsx           # Entity detail + impact analysis
  insights/
    page.tsx                  # Insights explorer
    [slug]/page.tsx           # Insight detail
  playground/page.tsx         # AI chat playground
  api/groq/route.ts           # Groq LLM API route

components/
  navigation.tsx              # App navigation
  graph-visualization.tsx     # D3.js force-directed graph
  entity-badge.tsx            # Typed entity badges
  stat-card.tsx               # Dashboard stat cards

lib/
  sanity.ts                   # Sanity client, GROQ queries, fetch helpers
```

---

## Deployment

Deployed on Vercel. Push to `main` to trigger automatic deployment. Set required environment variables in Vercel project settings.

---

## License

MIT

---

**Built for the Sanity Hackathon by [Sathvik Vempati](https://github.com/SVstudent)**
