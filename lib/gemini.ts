import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY environment variable. Add it to .env.local"
  )
}

const genAI = new GoogleGenerativeAI(apiKey)

/**
 * The Gemini Flash model used for document extraction.
 * Using gemini-2.0-flash for fast, cost-effective extraction.
 */
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" })

export { genAI, model }
