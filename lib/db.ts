import { type Db, MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to .env.local"
  )
}

/**
 * Cached MongoDB client for serverless environments.
 * In development, reuse the client across hot reloads.
 * In production, use a module-level singleton.
 */
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = MONGODB_URI as string
  const client = await MongoClient.connect(uri)
  const db = client.db() // Uses the default database from the connection string

  cachedClient = client
  cachedDb = db

  console.log("[DB] Connected to MongoDB")
  return { client, db }
}

export { connectToDatabase }
