"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { callAI } from "@/lib/ai/providers";

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function saveGymEquipment(items: { name: string; category: string }[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.gymEquipment.deleteMany({ where: { userId: session.user.id } });
  await prisma.gymEquipment.createMany({
    data: items.map((i) => ({ ...i, userId: session.user!.id, available: true })),
  });

  revalidatePath("/fitness");
  return { success: true };
}

export async function getGymEquipment() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.gymEquipment.findMany({ where: { userId: session.user.id } });
}

// ─── Exercise Library ─────────────────────────────────────────────────────────

export async function getExercises(muscleGroup?: string) {
  return prisma.exercise.findMany({
    where: muscleGroup ? { muscleGroup } : undefined,
    orderBy: { name: "asc" },
  });
}

// ─── Workout Plan ─────────────────────────────────────────────────────────────

export async function generateWorkoutPlan(profile: {
  goal: string;
  daysPerWeek: number;
  experienceLevel: string;
  currentWeight?: number;
  targetWeight?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const equipment = await prisma.gymEquipment.findMany({
    where: { userId: session.user.id, available: true },
  });

  const equipmentList = equipment.length > 0
    ? equipment.map((e) => e.name).join(", ")
    : "Dumbbells, Barbells, Cable Machines, Lat Pulldown, Seated Row, Leg Press, Hack Squat, Smith Machine, Adjustable Benches, Pull-Up Station, Chest Press Machine";

  const split = ["Push", "Pull", "Legs", "Push", "Pull", "Arms/Core"].slice(0, profile.daysPerWeek);

  const prompt = `Create a detailed ${profile.daysPerWeek}-day workout plan with this exact split: ${split.join(", ")}.

TRAINEE PROFILE:
- Goal: ${profile.goal}
- Experience: ${profile.experienceLevel}
- Current weight: ${profile.currentWeight ?? "unknown"}kg
- Available equipment: ${equipmentList}

PRIORITIES (in order):
1. Upper chest development
2. Side delt width
3. Rear delt thickness
4. Lat width and V-taper
5. Arm size (biceps and triceps)
6. Moderate leg volume
7. Core strength

REQUIREMENTS:
- Only use exercises possible with the listed equipment
- 4-5 exercises per session
- Include sets, reps range, and rest time for each exercise
- Progressive overload focus
- Hypertrophy rep ranges (8-15 reps)

Respond ONLY with a JSON object in this exact format, no markdown:
{
  "planName": "string",
  "days": [
    {
      "dayNumber": 1,
      "label": "Push",
      "estimatedMinutes": 60,
      "exercises": [
        {
          "exerciseName": "Incline Barbell Press",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 12,
          "restSeconds": 90,
          "order": 1,
          "notes": "Focus on upper chest stretch"
        }
      ]
    }
  ]
}`;

  const result = await callAI("You are an expert strength and hypertrophy coach. Return only valid JSON.", [
    { role: "user", content: prompt },
  ]);

  if (!result.success || !result.message) return { error: "AI generation failed" };

  let plan: any;
  try {
    const clean = result.message.replace(/```json|```/g, "").trim();
    plan = JSON.parse(clean);
  } catch {
    return { error: "Failed to parse AI response" };
  }

  // Deactivate existing plans
  await prisma.workoutPlan.updateMany({
    where: { userId: session.user.id, status: "active" },
    data: { status: "archived" },
  });

  // Get all exercises for matching
  const exercises = await prisma.exercise.findMany();

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: session.user.id,
      name: plan.planName,
      split: split.join("/"),
      weeks: 6,
      goal: profile.goal,
      status: "active",
      startDate: new Date(),
      plannedDays: {
        create: plan.days.map((day: any) => ({
          dayNumber: day.dayNumber,
          weekNumber: 1,
          label: day.label,
          estimatedMinutes: day.estimatedMinutes ?? 60,
          exercises: {
            create: day.exercises.map((ex: any) => {
              const match = exercises.find(
                (e) => e.name.toLowerCase() === ex.exerciseName.toLowerCase()
              ) ?? exercises.find(
                (e) => e.name.toLowerCase().includes(ex.exerciseName.toLowerCase().split(" ")[0])
              );
              if (!match) return null;
              return {
                exerciseId: match.id,
                sets: ex.sets,
                repsMin: ex.repsMin,
                repsMax: ex.repsMax,
                restSeconds: ex.restSeconds ?? 90,
                order: ex.order,
                notes: ex.notes,
              };
            }).filter(Boolean),
          },
        })),
      },
    },
    include: { plannedDays: { include: { exercises: { include: { exercise: true } } } } },
  });

  revalidatePath("/fitness");
  return { success: true, plan: workoutPlan };
}

export async function getActivePlan() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.workoutPlan.findFirst({
    where: { userId: session.user.id, status: "active" },
    include: {
      plannedDays: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { dayNumber: "asc" },
      },
    },
  });
}

export async function getTodayWorkout() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const plan = await getActivePlan();
  if (!plan) return null;

  const completedSessions = await prisma.workoutSession.count({
    where: { userId: session.user.id, status: "completed" },
  });

  const dayIndex = completedSessions % plan.plannedDays.length;
  return plan.plannedDays[dayIndex] ?? null;
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function startWorkoutSession(plannedWorkoutId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const planned = await prisma.plannedWorkout.findUnique({
    where: { id: plannedWorkoutId },
    include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
  });

  if (!planned) return { error: "Planned workout not found" };

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      plannedWorkoutId,
      name: planned.label,
      date: new Date(),
      status: "in_progress",
      exercises: {
        create: planned.exercises.map((pe, i) => ({
          exerciseId: pe.exerciseId,
          order: i + 1,
          sets: {
            create: Array.from({ length: pe.sets }, (_, j) => ({
              setNumber: j + 1,
              completed: false,
            })),
          },
        })),
      },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  revalidatePath("/fitness");
  return { success: true, session: workoutSession };
}

export async function logSet(setId: string, data: { weight?: number; reps?: number; completed: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const updated = await prisma.sessionSet.update({
    where: { id: setId },
    data,
  });

  return { success: true, set: updated };
}

export async function completeWorkoutSession(sessionId: string, durationMinutes: number, rating?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const workoutSession = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { status: "completed", durationMinutes, rating },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  // Check for personal records
  for (const ex of workoutSession.exercises) {
    for (const set of ex.sets) {
      if (!set.weight || !set.reps || !set.completed) continue;

      const existing = await prisma.personalRecord.findFirst({
        where: { userId: session.user.id, exerciseId: ex.exerciseId },
        orderBy: { weight: "desc" },
      });

      if (!existing || set.weight > existing.weight) {
        await prisma.personalRecord.create({
          data: {
            userId: session.user.id,
            exerciseId: ex.exerciseId,
            weight: set.weight,
            reps: set.reps,
            date: new Date(),
          },
        });
      }
    }
  }

  revalidatePath("/fitness");
  return { success: true, session: workoutSession };
}

export async function getWorkoutSessions(limit = 10) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });
}

export async function getPersonalRecords() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.personalRecord.findMany({
    where: { userId: session.user.id },
    include: { exercise: true },
    orderBy: { date: "desc" },
  });
}
