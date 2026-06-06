"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI, type AIMessage } from "@/lib/ai/providers";

const LIFEOS_SYSTEM = `You are LifeOS AI — the personal assistant embedded in Shaurya Goyal's life operating system.

ABOUT SHAURYA:
- 19 years old, second-year Business Management undergraduate at University of York (graduating May 2027)
- Runs a textile export business between India and UK
- Returning to India June 2026 to execute Ovier launch

OVIER BRAND (premium quiet-luxury menswear):
- Positioning: First Indian menswear brand stating fabric weight, cotton variety, origin and construction on every garment
- Hero product: polo shirts — 220gsm combed ring-spun cotton
- Batch 001: 400 pieces, 10 SKUs, 6 colours (Chalk, Noir, Dusk, Haze, Ember, Ochre)
- Constructions: Piqué SF (Chalk/Noir/Dusk/Haze, 240 pcs, ₹4,200) and Flat-knit RF (Ember/Ochre, 160 pcs, ₹4,500)
- COGS: ₹1,400 avg | Gross margin: 69% | Break-even: 39 polos/month
- Seed requirement: ₹6,38,000 | Year 1 target: ₹29L | Year 2: ₹1.18Cr | Year 3: ₹2.16Cr
- Brand references: Loro Piana, Brunello Cucinelli, Auralee — NOT Ralph Lauren, NOT Indian traditional
- Domain: ovier.co | Instagram: @ovierofficial
- Trademark Class 25: not yet filed (urgent)
- Designer meetings: Shreshthi (confirmed), FOD (pending) — India Week 2
- Status: pre-launch, manufacturer search in progress

INDIA WEEK 1 SEQUENCE (June 2026):
- Day 1: Father meeting — pitch with "0 of 53 polo shirts state fabric weight" stat
- Day 2: Trademark agent — Class 25 filing (₹4,500 + agent fee)
- Day 3: Mill conversation with family
- Day 4: Google Workspace + Naukri job post (needs shaurya@ovier.co first)
- Week 2: Designer meetings

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
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Pull memory context
  let memoryContext = "";
  try {
    const memories = await prisma.memoryRecord.findMany({
      where: { userId: session.user.id },
      take: 20,
    });
    if (memories.length > 0) {
      memoryContext = "\n\nUSER MEMORY:\n" +
        memories.map((m) => `${m.category}/${m.key}: ${JSON.stringify(m.value)}`).join("\n");
    }
  } catch {
    // Memory fetch failure is non-fatal
  }

  const system = LIFEOS_SYSTEM + memoryContext;
  const result = await callAI(system, messages);

  if (result.success && result.message) {
    // Persist conversation (fire-and-forget — don't block response)
    prisma.aIConversation.create({
      data: {
        userId: session.user.id,
        hub,
        messages: [...messages, { role: "assistant", content: result.message }] as object[],
      },
    }).catch(() => {});
  }

  return result;
}

export async function getDailyBriefing(): Promise<{ success: boolean; briefing?: string }> {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  const result = await sendAIMessage(
    [{
      role: "user",
      content: `Generate a sharp daily briefing for ${today}. Include:
1. One sentence framing the day relative to Ovier's launch timeline
2. Top 3 priorities today (mix of Ovier, fitness, university)
3. One specific insight or risk to be aware of
Under 150 words. No headers. Direct.`,
    }],
    "dashboard"
  );

  return { success: result.success, briefing: result.message };
}
