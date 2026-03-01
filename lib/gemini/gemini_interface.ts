import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

/**
 * Sends a prompt to Gemini and returns its text response.
 * @param prompt - The text prompt to send.
 * @returns The model's response as a string.
 */
export async function askGemini(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
