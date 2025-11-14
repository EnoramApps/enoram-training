"use client";

import { useState } from "react";
import axios from "axios";

interface PersonalInformation {
  name?: string;
  title?: string;
  city?: string;
}

interface Contact {
  email?: string;
  linkedin?: string;
  phone?: string;
}

interface Experience {
  company?: string;
  title?: string;
  startYear?: string;
  endYear?: string;
  location?: string;
  description?: string;
}

interface Education {
  university?: string;
  degree?: string;
  gpa?: string;
  startYear?: string;
  endYear?: string;
}

interface AdditionalInformation {
  technical_skills?: string;
}

interface Output {
  result?: any;
  personal_information?: PersonalInformation | null;
  contact?: Contact | null;
  experience: Experience[] | null;
  education: Education[] | null;
  additional_information?: AdditionalInformation | null;
}

function Api() {
  const [output, setOutput] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle AI Parsing
   * @param data - text yang sudah diekstrak dari PDF
   */
  const handleOpenAI = async (data: string) => {
    try {
      setLoading(true);
      console.log("🔵 Sending text to /api/parse:", data.slice(0, 200));

      const response = await axios.post("/api/parse", { text: data });
      console.log("🟢 Raw Response:", response.data);

      // === Auto-detect response structure and parse ===
      let parsedOutput = response.data;

      if (typeof response.data === "string") {
        try {
          parsedOutput = JSON.parse(response.data);
        } catch {
          console.warn("⚠️ Response bukan JSON valid (string biasa).");
        }
      } else if (response.data?.choices?.[0]?.message?.content) {
        try {
          parsedOutput = JSON.parse(
            response.data.choices[0].message.content.replace(/```json|```/g, "")
          );
        } catch {
          parsedOutput = {
            raw_output: response.data.choices[0].message.content,
          };
        }
      }

      console.log("🧩 Parsed Output:", parsedOutput);
      setOutput(parsedOutput);
    } catch (error: any) {
      console.error(
        "🔴 Error calling internal API:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("ini output output:", output);


  return { output, setOutput, handleOpenAI, loading };
}

export default Api;
