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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: system });
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const text = result.response.text();
    return text ? { success: true, message: text, provider: "gemini" } : { success: false, error: "Empty response" };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Gemini error" };
  }
}

export async function callAI(system: string, messages: AIMessage[]): Promise<AIResponse> {
  return callGemini(system, messages);
}
