import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/test-db
 * Simple endpoint to test MongoDB connectivity.
 */
export async function GET() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    return NextResponse.json({
      connected: false,
      error: "MONGODB_URI is not set in .env.local",
    })
  }

  // Show masked connection string for debugging
  const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, "//<user>:<password>@")

  try {
    const result = await connectToDatabase()
    if (!result) {
      return NextResponse.json({
        connected: false,
        error: "Connection failed — check server logs for details",
        connectionString: masked,
      })
    }

    // Try a simple operation
    const db = result.db
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      connected: true,
      database: db.databaseName,
      collections: collections.map((c) => c.name),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      connected: false,
      error: message,
      connectionString: masked,
    })
  }
}
