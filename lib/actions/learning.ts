"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLearningItems() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.learningItem.findMany({
    where: { userId: session.user!.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLearningItem(data: {
  title: string;
  type: string;
  category?: string;
  url?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const item = await prisma.learningItem.create({
    data: { userId: session.user!.id, ...data },
  });
  revalidatePath("/learning");
  return { success: true, item };
}

export async function updateLearningStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  await prisma.learningItem.update({
    where: { id, userId: session.user!.id },
    data: { status, completedAt: status === "completed" ? new Date() : null },
  });
  revalidatePath("/learning");
  return { success: true };
}
