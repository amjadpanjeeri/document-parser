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
 * gemini-2.5-flash: fast, cost-effective extraction with good quality.
 */
const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 8192,
  },
})

export { genAI, model }
