"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  timeframe: z.string(),
  targetDate: z.string().optional(),
});

export async function createGoal(data: {
  title: string;
  description?: string;
  category: string;
  timeframe: string;
  targetDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = goalSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const goal = await prisma.goal.create({
    data: {
      userId: session.user!.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      timeframe: parsed.data.timeframe,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });

  revalidatePath("/goals");
  return { success: true, goal };
}

export async function getGoals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.goal.findMany({
    where: { userId: session.user!.id },
    include: { milestones: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGoalProgress(id: string, progress: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const goal = await prisma.goal.update({
    where: { id, userId: session.user!.id },
    data: {
      progress,
      status: progress >= 100 ? "completed" : "active",
      completedAt: progress >= 100 ? new Date() : null,
    },
  });

  revalidatePath("/goals");
  return { success: true, goal };
}

export async function updateGoalStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.goal.update({
    where: { id, userId: session.user!.id },
    data: { status },
  });

  revalidatePath("/goals");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.goal.delete({ where: { id, userId: session.user!.id } });
  revalidatePath("/goals");
  return { success: true };
}

export async function createMilestone(goalId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const milestone = await prisma.milestone.create({
    data: { goalId, userId: session.user!.id, title },
  });

  revalidatePath("/goals");
  return { success: true, milestone };
}

export async function toggleMilestone(id: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.milestone.update({
    where: { id, userId: session.user!.id },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  revalidatePath("/goals");
  return { success: true };
}
