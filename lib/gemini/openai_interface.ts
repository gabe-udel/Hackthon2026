import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true,
});

/**
 * Sends a prompt to OpenAI and returns its text response.
 * @param prompt - The text prompt to send.
 * @returns The model's response as a string.
 */
export async function askChat(prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content || "";
}
