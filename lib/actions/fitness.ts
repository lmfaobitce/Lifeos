"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bodyWeightSchema = z.object({
  weight: z.number().min(20).max(300),
  date: z.string(),
  notes: z.string().optional(),
});

const workoutSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  duration: z.number().min(1),
  calories: z.number().optional(),
  notes: z.string().optional(),
  date: z.string(),
});

const nutritionSchema = z.object({
  date: z.string(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  water: z.number().optional(),
  notes: z.string().optional(),
});

export async function logBodyWeight(data: {
  weight: number;
  date: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = bodyWeightSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const entry = await prisma.bodyWeight.create({
    data: {
      userId: session.user!.id,
      weight: parsed.data.weight,
      date: new Date(parsed.data.date),
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/fitness");
  return { success: true, entry };
}

export async function getBodyWeights(limit = 30) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.bodyWeight.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function logWorkout(data: {
  name: string;
  type: string;
  duration: number;
  calories?: number;
  notes?: string;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = workoutSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const workout = await prisma.workout.create({
    data: {
      userId: session.user!.id,
      name: parsed.data.name,
      type: parsed.data.type,
      duration: parsed.data.duration,
      calories: parsed.data.calories,
      notes: parsed.data.notes,
      date: new Date(parsed.data.date),
    },
  });

  revalidatePath("/fitness");
  return { success: true, workout };
}

export async function getWorkouts(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.workout.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function logNutrition(data: {
  date: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  water?: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const existing = await prisma.nutritionLog.findFirst({
    where: {
      userId: session.user!.id,
      date: {
        gte: new Date(new Date(data.date).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(data.date).setHours(23, 59, 59, 999)),
      },
    },
  });

  if (existing) {
    const updated = await prisma.nutritionLog.update({
      where: { id: existing.id },
      data: {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        water: data.water,
        notes: data.notes,
      },
    });
    revalidatePath("/fitness");
    return { success: true, log: updated };
  }

  const log = await prisma.nutritionLog.create({
    data: {
      userId: session.user!.id,
      date: new Date(data.date),
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      water: data.water,
      notes: data.notes,
    },
  });

  revalidatePath("/fitness");
  return { success: true, log };
}

export async function getNutritionLogs(limit = 30) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.nutritionLog.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getFitnessStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [weights, workouts, nutrition] = await Promise.all([
    prisma.bodyWeight.findMany({
      where: { userId: session.user!.id },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.workout.findMany({
      where: {
        userId: session.user!.id,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.nutritionLog.findMany({
      where: {
        userId: session.user!.id,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const currentWeight = weights[0]?.weight ?? null;
  const weeklyWorkouts = workouts.length;
  const avgCalories =
    nutrition.length > 0
      ? Math.round(
          nutrition.reduce((a: number, n: { calories: number | null }) => a + (n.calories ?? 0), 0) / nutrition.length
        )
      : null;
  const avgProtein =
    nutrition.length > 0
      ? Math.round(
          nutrition.reduce((a: number, n: { protein: number | null }) => a + (n.protein ?? 0), 0) / nutrition.length
        )
      : null;

  return { currentWeight, weeklyWorkouts, avgCalories, avgProtein, weights };
}
