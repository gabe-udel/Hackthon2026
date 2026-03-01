import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

/**
 * Sends a prompt to Gemini and returns its text response.
 * @param prompt - The text prompt to send.
 * @returns The model's response as a string.
 */
export async function askChat(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "";
}

/**
 * Sends a receipt image to Gemini and returns CSV rows for each grocery item.
 * Columns: item_name, category, quantity, unit, price, expiration_date
 */
export async function getReciptEntries(base64Image: string): Promise<string> {
    const today = new Date().toISOString().split("T")[0];
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Extract the base64 data (remove data:image/jpeg;base64, prefix if present)
    const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

    const result = await model.generateContent([
        {
            text: `You are a grocery receipt analyzer. Today's date is ${today}.

Analyze this receipt image and extract every food/grocery item. For each item, provide:
1. Item name (clean, human-readable)
2. Category (EXACTLY one of: protein, carb, dairy, fruit, vegetable, other)
3. Quantity (numeric, e.g. 1, 2, 0.5; default to 1 if not visible)
4. Unit (e.g. count, lb, oz, kg, g, ml, L; default to "count" if not clear)
5. Price (the price shown on the receipt for that item, as a decimal number like 3.99; use 0 if not visible)
6. Estimated expiration date (YYYY-MM-DD format, based on typical shelf life from today)

Respond ONLY in CSV format with NO header row. Each line should be:
item_name,category,quantity,unit,price,expiration_date

Example:
Whole Milk,dairy,1,L,4.29,${today.slice(0, 8)}10
Chicken Breast,protein,1.5,lb,7.99,${today.slice(0, 8)}03
Bananas,fruit,6,count,1.49,${today.slice(0, 8)}05

Do not include non-food items (bags, tax, etc). Do not include any explanation, just the CSV lines.`,
        },
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
            },
        },
    ]);

    const response = await result.response;
    return response.text() || "";
}
