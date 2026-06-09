"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI, type AIMessage } from "@/lib/ai/providers";

const LIFEOS_SYSTEM = `You are LifeOS AI — the personal assistant embedded in Shaurya Goyal's life operating system.

ABOUT SHAURYA:
- 19 years old, second-year Business Management undergraduate at University of York (graduating May 2027)
- Runs a textile export business between India and UK
- Returning to India June 2026 to execute Ovier launch

YOUR PERSONALITY:
- Direct, specific, no filler
- Reference real Ovier numbers when relevant
- Challenge assumptions, don't just validate
- Actionable next steps, not general advice
- Keep responses concise — this is a chat interface, not an essay`;

export async function sendAIMessage(
  messages: AIMessage[],
  hub: string = "dashboard"
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await auth();

  let memoryContext = "";
  if (session?.user?.id) {
    try {
      const memories = await prisma.memoryRecord.findMany({
        where: { userId: session.user.id },
        take: 20,
      });
      if (memories.length > 0) {
        memoryContext = "\n\nUSER MEMORY:\n" +
          memories.map((m: any) => `${m.category}/${m.key}: ${JSON.stringify(m.value)}`).join("\n");
      }
    } catch {
      // Memory fetch failure is non-fatal
    }
  }

  const system = LIFEOS_SYSTEM + memoryContext;
  const result = await callAI(system, messages);

  if (result.success && result.message && session?.user?.id) {
    prisma.aiConversation.create({
      data: {
        userId: session.user.id,
        hub,
        messages: [...messages, { role: "assistant", content: result.message }] as object[],
      },
    }).catch(() => {});
  }

  return result;
}
