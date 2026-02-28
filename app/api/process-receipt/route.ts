import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, error: "imageBase64 is required" },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const today = format(new Date(), "yyyy-MM-dd");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this grocery receipt. Extract the food items.
Today's date is ${today}. Estimate realistic shelf-life for fresh items (e.g., milk lasts 7 days, spinach 5 days).
    Return ONLY a JSON array of objects with this exact schema, no markdown blocks, no other text:
    [{"name": "string", "category": "string", "quantity": "string", "expiration_date": "YYYY-MM-DD"}]`;

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(',')[1]
      : imageBase64;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ]);

    const rawText = result.response.text().trim();
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "");
    const items = JSON.parse(cleanJson);

    const { data, error } = await supabase.from("inventory").insert(items).select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to process receipt" },
      { status: 500 },
    );
  }
}
