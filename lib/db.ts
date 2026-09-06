import { type Db, MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

/**
 * Cached MongoDB client for serverless environments.
 * In development, reuse the client across hot reloads.
 * In production, use a module-level singleton.
 */
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let connectionFailed = false

async function connectToDatabase(): Promise<{
  client: MongoClient
  db: Db
} | null> {
  if (connectionFailed) return null
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!MONGODB_URI) {
    console.warn(
      "[DB] Missing MONGODB_URI — database features disabled. Add it to .env.local"
    )
    connectionFailed = true
    return null
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI)
    const db = client.db("docstruct")

    cachedClient = client
    cachedDb = db

    console.log("[DB] Connected to MongoDB")
    return { client, db }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DB error"
    console.error("[DB] Connection failed:", message)
    console.warn("[DB] Database features disabled — extraction still works.")
    connectionFailed = true
    return null
  }
}

export { connectToDatabase }
