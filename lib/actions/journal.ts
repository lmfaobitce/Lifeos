"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJournalEntry(data: {
  date: string;
  type: string;
  content: string;
  mood?: number;
  energy?: number;
  tags?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user!.id,
      date: new Date(data.date),
      type: data.type,
      content: data.content,
      mood: data.mood,
      energy: data.energy,
      tags: data.tags ?? [],
    },
  });

  revalidatePath("/journal");
  return { success: true, entry };
}

export async function getJournalEntries(limit = 30) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.journalEntry.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function updateJournalEntry(
  id: string,
  data: { content?: string; mood?: number; energy?: number }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.journalEntry.update({
    where: { id, userId: session.user!.id },
    data,
  });

  revalidatePath("/journal");
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.journalEntry.delete({ where: { id, userId: session.user!.id } });
  revalidatePath("/journal");
  return { success: true };
}
