import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'as3zvfs5',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN to get fresh data immediately after publishing
})

// Type definitions for our knowledge graph
export interface Entity {
  _id: string
  _type: 'entity'
  name: string
  slug: { current: string }
  entityType: 'person' | 'organization' | 'product' | 'place' | 'concept' | 'topic'
  description?: string
  image?: {
    asset: {
      _ref: string
      url?: string
    }
  }
  metadata?: {
    foundedDate?: string
    website?: string
    industry?: string
    headquarters?: string
  }
  aliases?: string[]
  tags?: string[]
  attributes?: { _ref: string }[]
  importance?: number
}

export interface Relationship {
  _id: string
  _type: 'relationship'
  source: { _ref: string } & Partial<Entity>
  target: { _ref: string } & Partial<Entity>
  relationshipType: 'relatedTo' | 'partOf' | 'hasAttribute' | 'worksAt' | 'founded' | 'investedIn' | 'acquired' | 'partnersWith' | 'competesWith' | 'uses' | 'created' | 'locatedIn' | 'influences' | 'dependsOn'
  description?: string
  strength?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface Content {
  _id: string
  _type: 'content'
  title: string
  slug: { current: string }
  contentType: 'article' | 'news' | 'research' | 'caseStudy' | 'tutorial' | 'opinion'
  excerpt?: string
  body?: any[]
  author?: string
  publishedAt?: string
  sourceUrl?: string
  relatedEntities?: ({ _ref: string } & Partial<Entity>)[]
  tags?: string[]
  sentiment?: number
  readingTime?: number
}

export interface Insight {
  _id: string
  _type: 'insight'
  title: string
  slug: { current: string }
  insightType: 'trend' | 'pattern' | 'anomaly' | 'prediction' | 'recommendation'
  summary: string
  details?: any[]
  confidence?: number
  impact?: 'low' | 'medium' | 'high' | 'critical'
  relatedEntities?: ({ _ref: string } & Partial<Entity>)[]
  relatedContent?: ({ _ref: string } & Partial<Content>)[]
  generatedAt?: string
  validUntil?: string
  dataPoints?: {
    label: string
    value: number
    date?: string
  }[]
}

export interface ContentCluster {
  _id: string
  _type: 'contentCluster'
  name: string
  slug: { current: string }
  description?: string
  theme?: string
  entities?: ({ _ref: string } & Partial<Entity>)[]
  content?: ({ _ref: string } & Partial<Content>)[]
  insights?: ({ _ref: string } & Partial<Insight>)[]
  color?: string
  priority?: number
}

// GROQ Queries
export const queries = {
  // Get all entities with optional type filter
  entities: (type?: string) => `
    *[_type == "entity"${type ? ` && entityType == "${type}"` : ''}] | order(importance desc) {
      _id,
      name,
      slug,
      entityType,
      description,
      image,
      metadata,
      aliases,
      tags,
      importance
    }
  `,

  // Get single entity by slug
  entityBySlug: (slug: string) => `
    *[_type == "entity" && slug.current == "${slug}"][0] {
      _id,
      name,
      slug,
      entityType,
      description,
      image,
      metadata,
      aliases,
      tags,
      importance
    }
  `,

  // Get relationships for an entity
  entityRelationships: (entityId: string) => `
    *[_type == "relationship" && (source._ref == "${entityId}" || target._ref == "${entityId}")] {
      _id,
      relationshipType,
      description,
      strength,
      startDate,
      endDate,
      isActive,
      "source": source->{_id, name, slug, entityType, importance},
      "target": target->{_id, name, slug, entityType, importance}
    }
  `,

  // Get all relationships with expanded references
  allRelationships: `
    *[_type == "relationship"] {
      _id,
      relationshipType,
      description,
      strength,
      isActive,
      "source": source->{_id, name, slug, entityType, importance},
      "target": target->{_id, name, slug, entityType, importance}
    }
  `,

  // Get all content (supports both 'content' and 'contentNode' types)
  allContent: `
    *[_type in ["content", "contentNode"]] | order(publishedAt desc) {
      _id,
      title,
      slug,
      contentType,
      excerpt,
      author,
      publishedAt,
      tags,
      sentiment,
      readingTime,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType}
    }
  `,

  // Get content by slug
  contentBySlug: (slug: string) => `
    *[_type in ["content", "contentNode"] && slug.current == "${slug}"][0] {
      _id,
      title,
      slug,
      contentType,
      excerpt,
      body,
      author,
      publishedAt,
      sourceUrl,
      tags,
      sentiment,
      readingTime,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType}
    }
  `,

  // Get all insights
  allInsights: `
    *[_type == "insight"] | order(generatedAt desc) {
      _id,
      title,
      slug,
      insightType,
      summary,
      confidence,
      impact,
      generatedAt,
      validUntil,
      dataPoints,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType}
    }
  `,

  // Get insight by slug
  insightBySlug: (slug: string) => `
    *[_type == "insight" && slug.current == "${slug}"][0] {
      _id,
      title,
      slug,
      insightType,
      summary,
      details,
      confidence,
      impact,
      generatedAt,
      validUntil,
      dataPoints,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType},
      "relatedContent": relatedContent[]->{_id, title, slug, contentType}
    }
  `,

  // Content referencing a specific entity (via relatedEntities reference)
  contentByEntity: (entityId: string) => `
    *[_type in ["content", "contentNode"] && references("${entityId}")] | order(publishedAt desc) {
      _id,
      title,
      slug,
      contentType,
      excerpt,
      publishedAt,
      readingTime,
      sentiment,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType}
    }
  `,

  // Insights referencing a specific entity
  insightsByEntity: (entityId: string) => `
    *[_type == "insight" && references("${entityId}")] | order(generatedAt desc) {
      _id,
      title,
      slug,
      insightType,
      summary,
      confidence,
      impact,
      generatedAt,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType}
    }
  `,

  // Related content via shared entities -- given a content ID, find other content that shares relatedEntities references
  relatedContentBySharedEntities: (contentId: string, entityIds: string[]) => `
    *[_type in ["content", "contentNode"] && _id != "${contentId}" && count((relatedEntities[]._ref)[@ in [${entityIds.map((id) => `"${id}"`).join(",")}]]) > 0] | order(publishedAt desc) {
      _id,
      title,
      slug,
      contentType,
      excerpt,
      publishedAt,
      "relatedEntities": relatedEntities[]->{_id, name, slug, entityType},
      "sharedEntityCount": count((relatedEntities[]._ref)[@ in [${entityIds.map((id) => `"${id}"`).join(",")}]])
    }
  `,

  // Second-degree entity connections: given an entity, get entities 2 hops away
  secondDegreeConnections: (entityId: string) => `
    {
      "firstDegree": *[_type == "relationship" && (source._ref == "${entityId}" || target._ref == "${entityId}")] {
        _id,
        relationshipType,
        strength,
        "connectedEntity": select(
          source._ref == "${entityId}" => target->{_id, name, slug, entityType, importance},
          target->{_id, name, slug, entityType, importance}
        )
      },
      "secondDegree": *[_type == "relationship" && (
        source._ref in *[_type == "relationship" && (source._ref == "${entityId}" || target._ref == "${entityId}")]{
          "id": select(source._ref == "${entityId}" => target._ref, source._ref)
        }.id
        ||
        target._ref in *[_type == "relationship" && (source._ref == "${entityId}" || target._ref == "${entityId}")]{
          "id": select(source._ref == "${entityId}" => target._ref, source._ref)
        }.id
      ) && source._ref != "${entityId}" && target._ref != "${entityId}"] {
        _id,
        relationshipType,
        strength,
        "source": source->{_id, name, slug, entityType, importance},
        "target": target->{_id, name, slug, entityType, importance}
      }
    }
  `,

  // Dashboard stats
  dashboardStats: `
    {
      "entityCount": count(*[_type == "entity"]),
      "relationshipCount": count(*[_type == "relationship"]),
      "contentCount": count(*[_type in ["content", "contentNode"]]),
      "insightCount": count(*[_type == "insight"]),
      "entityTypes": *[_type == "entity"] {entityType} | unique,
      "recentContent": *[_type in ["content", "contentNode"]] | order(publishedAt desc)[0...3] {
        _id, title, slug, contentType, publishedAt
      },
      "topInsights": *[_type == "insight" && impact in ["high", "critical"]] | order(confidence desc)[0...3] {
        _id, title, slug, insightType, impact, confidence
      }
    }
  `,
}

// Direct count helpers for dashboard
export async function getRelationshipCount(): Promise<number> {
  try {
    const result = await sanityClient.fetch(`count(*[_type == "relationship"])`)
    return result || 0
  } catch (error) {
    console.error('[v0] Error counting relationships:', error)
    return 0
  }
}

export async function getContentCount(): Promise<number> {
  try {
    const result = await sanityClient.fetch(`count(*[_type == "contentNode"])`)
    return result || 0
  } catch (error) {
    console.error('[v0] Error counting content:', error)
    return 0
  }
}

// Helper functions with error handling
export async function fetchEntities(type?: string): Promise<Entity[]> {
  try {
    const result = await sanityClient.fetch(queries.entities(type))
    return result || []
  } catch (error) {
    console.error('[v0] Error fetching entities:', error)
    return []
  }
}

export async function fetchEntityBySlug(slug: string): Promise<Entity | null> {
  try {
    return await sanityClient.fetch(queries.entityBySlug(slug))
  } catch (error) {
    console.error('[v0] Error fetching entity by slug:', error)
    return null
  }
}

export async function fetchEntityRelationships(entityId: string): Promise<Relationship[]> {
  try {
    const result = await sanityClient.fetch(queries.entityRelationships(entityId))
    return result || []
  } catch (error) {
    console.error('[v0] Error fetching entity relationships:', error)
    return []
  }
}

export async function fetchAllRelationships(): Promise<Relationship[]> {
  try {
    const result = await sanityClient.fetch(queries.allRelationships)
    return result || []
  } catch (error) {
    console.error('[v0] Error fetching all relationships:', error)
    return []
  }
}

export async function fetchAllContent(): Promise<Content[]> {
  try {
    const result = await sanityClient.fetch(queries.allContent)
    return result || []
  } catch (error) {
    console.error('[v0] Error fetching all content:', error)
    return []
  }
}

export async function fetchContentBySlug(slug: string): Promise<Content | null> {
  try {
    return await sanityClient.fetch(queries.contentBySlug(slug))
  } catch (error) {
    console.error('[v0] Error fetching content by slug:', error)
    return null
  }
}

export async function fetchAllInsights(): Promise<Insight[]> {
  try {
    const result = await sanityClient.fetch(queries.allInsights)
    return result || []
  } catch (error) {
    console.error('[v0] Error fetching all insights:', error)
    return []
  }
}

export async function fetchInsightBySlug(slug: string): Promise<Insight | null> {
  try {
    return await sanityClient.fetch(queries.insightBySlug(slug))
  } catch (error) {
    console.error('[v0] Error fetching insight by slug:', error)
    return null
  }
}

export async function fetchDashboardStats() {
  try {
    const result = await sanityClient.fetch(queries.dashboardStats)
    return result
  } catch (error) {
    console.error('[v0] Error fetching dashboard stats:', error)
    return {
      entityCount: 0,
      relationshipCount: 0,
      contentCount: 0,
      insightCount: 0,
      entityTypes: [],
      recentContent: [],
      topInsights: [],
    }
  }
}

// Fetch content referencing a specific entity
export async function fetchContentByEntity(entityId: string): Promise<Content[]> {
  try {
    const result = await sanityClient.fetch(queries.contentByEntity(entityId))
    return result || []
  } catch (error) {
    console.error('Error fetching content by entity:', error)
    return []
  }
}

// Fetch insights referencing a specific entity
export async function fetchInsightsByEntity(entityId: string): Promise<Insight[]> {
  try {
    const result = await sanityClient.fetch(queries.insightsByEntity(entityId))
    return result || []
  } catch (error) {
    console.error('Error fetching insights by entity:', error)
    return []
  }
}

// Fetch related content by shared entities
export async function fetchRelatedContentBySharedEntities(
  contentId: string,
  entityIds: string[]
): Promise<(Content & { sharedEntityCount: number })[]> {
  try {
    if (entityIds.length === 0) return []
    const result = await sanityClient.fetch(
      queries.relatedContentBySharedEntities(contentId, entityIds)
    )
    return result || []
  } catch (error) {
    console.error('Error fetching related content:', error)
    return []
  }
}

// Fetch second-degree connections for an entity
export async function fetchSecondDegreeConnections(entityId: string) {
  try {
    const result = await sanityClient.fetch(queries.secondDegreeConnections(entityId))
    return result || { firstDegree: [], secondDegree: [] }
  } catch (error) {
    console.error('Error fetching second-degree connections:', error)
    return { firstDegree: [], secondDegree: [] }
  }
}

const token = process.env.SANITY_TOKEN; // Declare the token variable
