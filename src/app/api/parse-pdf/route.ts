import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        let text = "";

        // 🔹 Cek apakah input JSON atau plain text
        try {
            const parsed = JSON.parse(bodyText);
            text = parsed.text || "";
        } catch {
            console.warn("⚠️ Body bukan JSON valid, pakai raw text");
            text = bodyText;
        }

        if (!text.trim()) {
            throw new Error("❌ Empty text received — PDF mungkin gagal dibaca");
        }

        // === ENV SETUP ===
        const API_KEY = process.env.AI_API_KEY;
        const API_URL = process.env.AI_BASE_URL || "https://api.openrouter.ai/api/v1";
        const MODEL = process.env.AI_MODEL || "openai/gpt-3.5-turbo";

        if (!API_KEY) {
            throw new Error("❌ Missing AI_API_KEY di .env");
        }

        console.log("🧠 Using model:", MODEL);

        const MAX_CHARS = 10000;
        if (text.length > MAX_CHARS) {
            console.warn(`⚠️ Text terlalu panjang (${text.length} chars), dipotong jadi ${MAX_CHARS}`);
            text = text.slice(0, MAX_CHARS);
        }

        // === PROMPT ===
        const messages = [
            {
                role: "system",
                content:
                    "You are a professional resume parsing assistant. You must output ONLY valid JSON following this schema.",
            },
            {
                role: "user",
                content: `
Summarize the following resume text into valid JSON:

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

Resume:
${text}
        `,
            },
        ];

        // === CALL OPENROUTER ===
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Warkop Resume AI Demo",
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("❌ OpenRouter API Error:", err);
            throw new Error(`OpenRouter returned ${response.status}: ${err}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || "";
        const cleaned = content.replace(/```json|```/g, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { raw_output: cleaned };
        }

        // === 🔥 SIMPAN KE FIRESTORE (SATU KALI SAJA) ===
        try {
            await addDoc(collection(db, "summaries"), {
                createdAt: serverTimestamp(),
                model: MODEL,
                textLength: text.length,
                result: parsed,
            });
            console.log("✅ Hasil parsing disimpan ke Firestore");
        } catch (fireErr) {
            console.error("🔥 Gagal menyimpan ke Firestore:", fireErr);
        }

        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error("❌ AI Error:", err);
        return NextResponse.json(
            { error: err.message || "Unexpected error occurred" },
            { status: 500 }
        );
    }
}
