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

export async function getReciptEntries(base64Image: string): Promise<string> {
    const today = new Date().toISOString().split("T")[0];

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `You are a grocery receipt analyzer. Today's date is ${today}.

Analyze this receipt image and extract every food/grocery item. For each item, provide:
1. Item name (clean, human-readable)
2. Category (EXACTLY one of: protein, carb, dairy, fruit, vegetable, other)
3. Estimated expiration date (YYYY-MM-DD format, based on typical shelf life from today)
4. Price (the price shown on the receipt for that item, as a decimal number like 3.99; use 0 if not visible)

Respond ONLY in CSV format with NO header row. Each line should be:
item_name,category,expiration_date,price

Example:
Whole Milk,dairy,2026-03-10,4.29
Chicken Breast,protein,2026-03-03,7.99
Bananas,fruit,2026-03-05,1.49

Do not include non-food items (bags, tax, etc). Do not include any explanation, just the CSV lines.`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Image,
                        },
                    },
                ],
            },
        ],
        max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "";
}
