"use server";

import { callAI, type AIMessage } from "@/lib/ai/providers";

const LIFEOS_SYSTEM = `You are LifeOS AI, a personal assistant for Shaurya. Be direct and concise.`;

export async function sendAIMessage(
  messages: AIMessage[],
  hub: string = "dashboard"
): Promise<{ success: boolean; message?: string; error?: string }> {
  return callAI(LIFEOS_SYSTEM, messages);
}
