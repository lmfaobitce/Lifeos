import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "gemini" | "openai" | "anthropic" | "ollama";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
  provider?: AIProvider;
}

async function callGemini(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: "GEMINI_API_KEY not set" };
  try {
    const lastMessage = messages[messages.length - 1].content;
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? { success: true, message: text, provider: "gemini" } : { success: false, error: "Empty response" };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Gemini error" };
  }
}

export async function callAI(system: string, messages: AIMessage[]): Promise<AIResponse> {
  return callGemini(system, messages);
}
