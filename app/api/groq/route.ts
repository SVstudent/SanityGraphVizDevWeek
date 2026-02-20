import { NextRequest, NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query" },
        { status: 400 }
      )
    }

    // Basic GROQ validation - check for potentially dangerous operations
    const lowerQuery = query.toLowerCase()
    if (
      lowerQuery.includes("delete") ||
      lowerQuery.includes("patch") ||
      lowerQuery.includes("create")
    ) {
      return NextResponse.json(
        { error: "Only read operations are allowed" },
        { status: 403 }
      )
    }

    const result = await sanityClient.fetch(query)

    return NextResponse.json(result)
  } catch (error) {
    console.error("GROQ query error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    )
  }
}
