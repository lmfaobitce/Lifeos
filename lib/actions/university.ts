"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAssignment(data: {
  title: string; module: string; type: string;
  dueDate?: string; weight?: number; notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const assignment = await prisma.assignment.create({
    data: {
      userId: session.user!.id, title: data.title, module: data.module,
      type: data.type, dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      weight: data.weight, notes: data.notes,
    },
  });
  revalidatePath("/university");
  return { success: true, assignment };
}

export async function getAssignments() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.assignment.findMany({
    where: { userId: session.user!.id },
    orderBy: { dueDate: "asc" },
  });
}

export async function updateAssignmentStatus(id: string, status: string, grade?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  await prisma.assignment.update({
    where: { id, userId: session.user!.id },
    data: { status, grade },
  });
  revalidatePath("/university");
  return { success: true };
}

export async function addGrade(data: { module: string; year: number; grade: number; credits?: number; notes?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const grade = await prisma.grade.create({ data: { userId: session.user!.id, ...data } });
  revalidatePath("/university");
  return { success: true, grade };
}

export async function getGrades() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.grade.findMany({
    where: { userId: session.user!.id },
    orderBy: { createdAt: "desc" },
  });
}
