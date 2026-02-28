// app/api/process-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addItem } from '@/lib/supabase/interface';

// 1. Define your exact interface
export interface Item {
  name: string;
  category: string;
  quantity: string;
  expDate: string;
  createdDate: string;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type
      }
    };

    // Use a stable multimodal model
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // 2. Instruct the AI with the exact structure and rules
    const prompt = `
      Analyze this receipt image and extract ONLY the food items. 
      Strictly ignore any non-food items (e.g., taxes, cleaning supplies, utensils, fees).
      
      For each food item, extract the data to match this exact JSON structure:
      [
        {
          "name": "string (name of the food item)",
          "category": "string (food category, e.g., Dairy, Produce, Meat)",
          "quantity": "string (quantity or weight, e.g., '1', '2 lbs')",
          "expDate": "string (estimated expiration date in YYYY-MM-DD format based on standard shelf life if not printed)",
          "createdDate": "string (use strictly: ${today})"
        }
      ]

      Rules:
      1. Dates MUST strictly be in "YYYY-MM-DD" format.
      2. Quantity must be a string.
      3. Output NOTHING ELSE but a valid JSON array of objects.
    `;

    // 3. Force JSON output via generationConfig
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    let responseText = result.response.text().trim();

    // Safety net: strip out markdown backticks just in case
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    // 4. Parse and cast to your specific Interface
    let foodItems: Item[] = [];
    try {
      foodItems = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON. Raw text:", responseText);
      return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 });
    }

    // 5. Save each item to the database using your addItem function
    try {
      // Using Promise.all to insert all items concurrently for better performance
      await Promise.all(
        foodItems.map((item) => 
          addItem(
            item.name, 
            item.category, 
            item.quantity, 
            item.expDate,     // Mapping to expirationDate
            item.createdDate  // Mapping to createdAt
          )
        )
      );
    } catch (dbError) {
      console.error("Error saving items to database:", dbError);
      return NextResponse.json({ error: 'Failed to save items to the database.' }, { status: 500 });
    }

    // 6. Return the successfully processed and saved items
    return NextResponse.json({ success: true, items: foodItems });

  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json({ error: 'An error occurred while processing the image.' }, { status: 500 });
  }
}