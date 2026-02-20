import { cn } from "@/lib/utils"
import {
  User,
  Building2,
  Package,
  MapPin,
  Sparkles,
  Hash,
  Lightbulb,
} from "lucide-react"

type EntityType = 'person' | 'organization' | 'product' | 'place' | 'concept' | 'topic'

const entityConfig: Record<EntityType, { icon: typeof User; label: string; className: string }> = {
  person: {
    icon: User,
    label: "Person",
    className: "bg-[oklch(0.7_0.18_250/0.15)] text-[oklch(0.7_0.18_250)] border-[oklch(0.7_0.18_250/0.3)]",
  },
  organization: {
    icon: Building2,
    label: "Organization",
    className: "bg-[oklch(0.7_0.15_145/0.15)] text-[oklch(0.7_0.15_145)] border-[oklch(0.7_0.15_145/0.3)]",
  },
  product: {
    icon: Package,
    label: "Product",
    className: "bg-[oklch(0.75_0.15_50/0.15)] text-[oklch(0.75_0.15_50)] border-[oklch(0.75_0.15_50/0.3)]",
  },
  place: {
    icon: MapPin,
    label: "Place",
    className: "bg-[oklch(0.7_0.12_200/0.15)] text-[oklch(0.7_0.12_200)] border-[oklch(0.7_0.12_200/0.3)]",
  },
  concept: {
    icon: Lightbulb,
    label: "Concept",
    className: "bg-[oklch(0.65_0.15_280/0.15)] text-[oklch(0.65_0.15_280)] border-[oklch(0.65_0.15_280/0.3)]",
  },
  topic: {
    icon: Hash,
    label: "Topic",
    className: "bg-[oklch(0.65_0.2_320/0.15)] text-[oklch(0.65_0.2_320)] border-[oklch(0.65_0.2_320/0.3)]",
  },
}

interface EntityBadgeProps {
  type: EntityType
  showLabel?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EntityBadge({ type, showLabel = true, className, size = "md" }: EntityBadgeProps) {
  const config = entityConfig[type] || entityConfig.concept
  const Icon = config.icon

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs gap-1",
    md: "px-2 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

export function getEntityColor(type: EntityType): string {
  const colors: Record<EntityType, string> = {
    person: "oklch(0.7 0.18 250)",
    organization: "oklch(0.7 0.15 145)",
    product: "oklch(0.75 0.15 50)",
    place: "oklch(0.7 0.12 200)",
    concept: "oklch(0.65 0.15 280)",
    topic: "oklch(0.65 0.2 320)",
  }
  return colors[type] || colors.concept
}
