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
 * gemini-3.5-flash-lite: fastest, most cost-effective 3.x model.
 */
const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    temperature: 0,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },
})

export { genAI, model }
