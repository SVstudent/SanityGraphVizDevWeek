"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Entity, Relationship } from "@/lib/sanity"
import { getEntityColor } from "@/components/entity-badge"

interface GraphVisualizationProps {
  entities: Entity[]
  relationships: Relationship[]
  focusEntityId?: string
}

interface Node {
  id: string
  name: string
  type: Entity["entityType"]
  importance: number
  x: number
  y: number
  vx: number
  vy: number
  slug?: string
}

interface Edge {
  source: string
  target: string
  type: string
  strength: number
}

export function GraphVisualization({
  entities,
  relationships,
  focusEntityId,
}: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const animationRef = useRef<number>()

  // Initialize nodes and edges
  useEffect(() => {
    // Create nodes from entities
    nodesRef.current = entities.map((entity, i) => ({
      id: entity._id,
      name: entity.name,
      type: entity.entityType,
      importance: entity.importance || 50,
      slug: entity.slug?.current,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 400,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 300,
      vx: 0,
      vy: 0,
    }))

    // Create edges from relationships
    edgesRef.current = relationships
      .filter((rel) => {
        const sourceExists = nodesRef.current.some(
          (n) => n.id === rel.source?._id || n.id.includes(rel.source?._id || "")
        )
        const targetExists = nodesRef.current.some(
          (n) => n.id === rel.target?._id || n.id.includes(rel.target?._id || "")
        )
        return sourceExists && targetExists
      })
      .map((rel) => ({
        source: rel.source?._id || "",
        target: rel.target?._id || "",
        type: rel.relationshipType,
        strength: rel.strength || 50,
      }))
  }, [entities, relationships, dimensions])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: 500 })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas DPI for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    const animate = () => {
      const nodes = nodesRef.current
      const edges = edgesRef.current

      // Apply forces
      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 2000 / (dist * dist)

          nodes[i].vx -= (dx / dist) * force
          nodes[i].vy -= (dy / dist) * force
          nodes[j].vx += (dx / dist) * force
          nodes[j].vy += (dy / dist) * force
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const source = nodes.find((n) => n.id.includes(edge.source))
        const target = nodes.find((n) => n.id.includes(edge.target))
        if (!source || !target) continue

        const dx = target.x - source.x
        const dy = target.y - source.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 150) * 0.01

        source.vx += (dx / dist) * force
        source.vy += (dy / dist) * force
        target.vx -= (dx / dist) * force
        target.vy -= (dy / dist) * force
      }

      // Center gravity
      for (const node of nodes) {
        const dx = dimensions.width / 2 - node.x
        const dy = dimensions.height / 2 - node.y
        node.vx += dx * 0.001
        node.vy += dy * 0.001
      }

      // Apply velocity with damping
      for (const node of nodes) {
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy

        // Keep within bounds
        node.x = Math.max(50, Math.min(dimensions.width - 50, node.x))
        node.y = Math.max(50, Math.min(dimensions.height - 50, node.y))
      }

      // Clear canvas
      ctx.fillStyle = "oklch(0.12 0 0)"
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      // Draw edges
      ctx.strokeStyle = "oklch(0.3 0 0)"
      ctx.lineWidth = 1
      for (const edge of edges) {
        const source = nodes.find((n) => n.id.includes(edge.source))
        const target = nodes.find((n) => n.id.includes(edge.target))
        if (!source || !target) continue

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }

      // Draw nodes
      for (const node of nodes) {
        const radius = 8 + (node.importance / 100) * 12
        const color = getEntityColor(node.type)
        const isHovered = hoveredNode?.id === node.id
        const isFocused = focusEntityId && node.id.includes(focusEntityId)

        // Glow effect for hovered/focused nodes
        if (isHovered || isFocused) {
          ctx.shadowBlur = 20
          ctx.shadowColor = color
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        ctx.shadowBlur = 0

        // Node border
        ctx.strokeStyle = isHovered || isFocused ? "white" : "oklch(0.3 0 0)"
        ctx.lineWidth = isHovered || isFocused ? 2 : 1
        ctx.stroke()

        // Label
        ctx.fillStyle = "oklch(0.85 0 0)"
        ctx.font = "12px Geist, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(node.name, node.x, node.y + radius + 16)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, hoveredNode, focusEntityId])

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nodes = nodesRef.current
    let found: Node | null = null

    for (const node of nodes) {
      const radius = 8 + (node.importance / 100) * 12
      const dx = node.x - x
      const dy = node.y - y
      if (dx * dx + dy * dy < radius * radius) {
        found = node
        break
      }
    }

    setHoveredNode(found)
    canvas.style.cursor = found ? "pointer" : "default"
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode?.slug) {
      window.location.href = `/graph/${hoveredNode.slug}`
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg border border-border bg-card overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      {hoveredNode && (
        <div
          className="pointer-events-none absolute rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: Math.min(hoveredNode.x + 20, dimensions.width - 200),
            top: Math.min(hoveredNode.y - 40, dimensions.height - 80),
          }}
        >
          <p className="font-medium">{hoveredNode.name}</p>
          <p className="text-sm capitalize text-muted-foreground">
            {hoveredNode.type}
          </p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg border border-border bg-card/90 px-4 py-2 backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {entities.length} nodes
        </span>
        <span className="text-sm text-muted-foreground">
          {relationships.length} edges
        </span>
      </div>
    </div>
  )
}
