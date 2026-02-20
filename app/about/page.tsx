import Link from "next/link"
import {
  Network,
  Database,
  Cpu,
  Lightbulb,
  Code2,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  Share2,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Network,
    title: "Knowledge Graph",
    description:
      "Model entities and their relationships in a flexible graph structure. Support for multiple entity types and relationship categories.",
  },
  {
    icon: Database,
    title: "Sanity-Powered",
    description:
      "Built on Sanity's composable content platform. Leverage GROQ queries, real-time updates, and structured content modeling.",
  },
  {
    icon: Lightbulb,
    title: "AI Insights",
    description:
      "Generate trends, patterns, and predictions from your knowledge graph data. Track confidence levels and impact assessments.",
  },
  {
    icon: Layers,
    title: "Content Clustering",
    description:
      "Organize content into thematic clusters. Connect articles, entities, and insights around key topics.",
  },
  {
    icon: Code2,
    title: "GROQ Playground",
    description:
      "Experiment with queries directly against your knowledge graph. Test and refine data access patterns.",
  },
  {
    icon: Cpu,
    title: "Extensible Schema",
    description:
      "Flexible schema design supports custom entity types, metadata fields, and relationship categories.",
  },
]

const techStack = [
  { name: "Next.js 15", url: "https://nextjs.org" },
  { name: "Sanity", url: "https://sanity.io" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com" },
  { name: "shadcn/ui", url: "https://ui.shadcn.com" },
  { name: "TypeScript", url: "https://typescriptlang.org" },
  { name: "Vercel", url: "https://vercel.com" },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mx-auto inline-flex items-center justify-center rounded-xl bg-accent/20 p-4">
          <Network className="h-10 w-10 text-accent" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          About StructureOS
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          StructureOS is a content intelligence layer built on Sanity. It provides
          a knowledge graph foundation for modeling entities, relationships, and
          AI-generated insights.
        </p>
        <div className="mt-8 flex justify-center gap-4">
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
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex rounded-lg bg-secondary p-3">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Schema Overview */}
      <section className="mb-16">
        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">Schema Architecture</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-accent">
                Core Document Types
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                    entity
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Nodes in the knowledge graph (people, organizations, products, etc.)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                    relationship
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Edges connecting entities with typed connections
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                    content
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Articles, research, and documents linked to entities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                    insight
                  </span>
                  <span className="text-sm text-muted-foreground">
                    AI-generated analysis with confidence scoring
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                    contentCluster
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Thematic groupings of related content and entities
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-accent">
                Entity Types
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "person",
                  "organization",
                  "product",
                  "technology",
                  "event",
                  "location",
                  "concept",
                ].map((type) => (
                  <div
                    key={type}
                    className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm capitalize"
                  >
                    {type}
                  </div>
                ))}
              </div>
              <h3 className="mb-4 mt-6 text-lg font-semibold text-accent">
                Relationship Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "worksAt",
                  "founded",
                  "investedIn",
                  "acquired",
                  "partnersWith",
                  "competesWith",
                  "uses",
                  "created",
                  "locatedIn",
                  "relatedTo",
                ].map((type) => (
                  <span
                    key={type}
                    className="rounded bg-secondary px-2 py-1 text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Only Structured Content Makes Possible */}
      <section className="mb-16">
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-2">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">Features Only Structured Content Makes Possible</h2>
          </div>
          <p className="mb-8 max-w-3xl text-muted-foreground">
            StructureOS goes beyond displaying content. By leveraging Sanity{"'"}s typed references and GROQ queries, it enables features that flat files, markdown, or unstructured CMS content simply cannot support.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-secondary p-2">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">Entity Impact Analysis</h3>
              <p className="text-sm text-muted-foreground">
                For any entity, instantly see every content piece and insight that references it, plus second-degree connections discovered by traversing typed relationship references. This requires queryable structured content with typed references between documents.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-secondary p-2">
                <Share2 className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">Cross-Entity Content Discovery</h3>
              <p className="text-sm text-muted-foreground">
                When viewing an article, discover related content that shares knowledge graph entities -- ranked by how many entities overlap. This GROQ-powered join across references is impossible with flat content.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-secondary p-2">
                <GitBranch className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">Second-Degree Connection Graph</h3>
              <p className="text-sm text-muted-foreground">
                Traverse two hops of relationships to discover entities connected through intermediaries. Only possible because relationships are first-class documents with typed source/target references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Built With</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {techStack.map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-accent/50"
            >
              <span className="font-medium">{tech.name}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-lg border border-border bg-gradient-to-b from-card to-secondary/30 p-12">
          <h2 className="mb-4 text-2xl font-bold">Ready to explore?</h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Dive into the knowledge graph and discover connections between entities,
            content, and insights.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
