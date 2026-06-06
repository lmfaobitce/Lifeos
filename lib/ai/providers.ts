/**
 * Provider-agnostic AI layer for LifeOS.
 *
 * Switch providers via env vars — no application code changes needed:
 *   AI_PROVIDER = "gemini" | "openai" | "anthropic" | "ollama"
 *
 * Default: gemini (free via Google AI Studio)
 */

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

// ─── Gemini ──────────────────────────────────────────────────────────────────
async function callGemini(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: "GEMINI_API_KEY not set" };

  // Gemini has no system role — prepend to first user message
  const contents = messages.map((m, i) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: i === 0 && m.role === "user" ? `${system}\n\n---\n\n${m.content}` : m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    return { success: false, error: "Gemini API error" };
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text
    ? { success: true, message: text, provider: "gemini" }
    : { success: false, error: "Empty response from Gemini" };
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────
async function callOpenAI(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { success: false, error: "OPENAI_API_KEY not set" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) return { success: false, error: "OpenAI API error" };
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  return text
    ? { success: true, message: text, provider: "openai" }
    : { success: false, error: "Empty response from OpenAI" };
}

// ─── Anthropic ───────────────────────────────────────────────────────────────
async function callAnthropic(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { success: false, error: "ANTHROPIC_API_KEY not set" };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) return { success: false, error: "Anthropic API error" };
  const data = await res.json();
  const text = data.content?.[0]?.text;
  return text
    ? { success: true, message: text, provider: "anthropic" }
    : { success: false, error: "Empty response from Anthropic" };
}

// ─── Ollama (local) ───────────────────────────────────────────────────────────
async function callOllama(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) return { success: false, error: "Ollama API error" };
  const data = await res.json();
  const text = data.message?.content;
  return text
    ? { success: true, message: text, provider: "ollama" }
    : { success: false, error: "Empty response from Ollama" };
}

// ─── Router (single entry point for all app code) ────────────────────────────
export async function callAI(system: string, messages: AIMessage[]): Promise<AIResponse> {
  const provider = (process.env.AI_PROVIDER ?? "gemini") as AIProvider;
  switch (provider) {
    case "gemini":    return callGemini(system, messages);
    case "openai":    return callOpenAI(system, messages);
    case "anthropic": return callAnthropic(system, messages);
    case "ollama":    return callOllama(system, messages);
    default:          return { success: false, error: `Unknown AI_PROVIDER: ${provider}` };
  }
}
