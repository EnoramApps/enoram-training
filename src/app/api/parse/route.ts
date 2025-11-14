import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const API_KEY = process.env.AI_API_KEY!;
    const MODEL = process.env.AI_MODEL || "openai/gpt-3.5-turbo";
    const API_URL = process.env.AI_BASE_URL || "https://api.openrouter.ai/api/v1";

    if (!text?.trim()) {
      throw new Error("❌ Text kosong — tidak ada data untuk dikirim ke AI");
    }

    const shortenedText = text.length > 10000 ? text.slice(0, 10000) : text;

    const messages = [
      {
        role: "system",
        content:
          "You are a resume parsing assistant. Extract structured data and return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `
Summarize this resume into structured JSON format:

{
  "personal_information": { "name": "", "title": "", "city": "" },
  "contact": { "email": "", "linkedin": "", "phone": "" },
  "experience": [
    { "company": "", "title": "", "startYear": "", "endYear": "", "location": "", "description": "" }
  ],
  "education": [
    { "university": "", "degree": "", "gpa": "", "startYear": "", "endYear": "" }
  ],
  "additional_information": { "technical_skills": "" }
}

Resume text:
${shortenedText}
        `,
      },
    ];

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // opsional
        "X-Title": "Resume Summarizer Demo",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 800,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ OpenRouter API Error:", err);
      throw new Error(`OpenRouter returned ${response.status}: ${err}`);
    }

    const data = await response.json();

    const raw = data?.choices?.[0]?.message?.content || "";
    console.log("ini raw: ", raw);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(cleaned);
    } catch {
      parsedOutput = { raw_output: cleaned };
    }

    console.log("ini parsedOutput: ", parsedOutput);


    return NextResponse.json(parsedOutput);
  } catch (error: any) {
    console.error("❌ AI Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}
