"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNote(data: {
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const note = await prisma.note.create({
    data: {
      userId: session.user!.id,
      title: data.title,
      content: data.content,
      tags: data.tags ?? [],
      pinned: data.pinned ?? false,
    },
  });

  revalidatePath("/notes");
  return { success: true, note };
}

export async function getNotes(search?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.note.findMany({
    where: {
      userId: session.user!.id,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string; tags?: string[]; pinned?: boolean }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.note.update({
    where: { id, userId: session.user!.id },
    data,
  });

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.note.delete({ where: { id, userId: session.user!.id } });
  revalidatePath("/notes");
  return { success: true };
}

export async function togglePin(id: string, pinned: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.note.update({
    where: { id, userId: session.user!.id },
    data: { pinned },
  });

  revalidatePath("/notes");
  return { success: true };
}
