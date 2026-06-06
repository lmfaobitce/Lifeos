"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOvierDashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [suppliers, manufacturers, products, samples, launches] =
    await Promise.all([
      prisma.supplier.findMany({
        where: { userId: session.user!.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.manufacturer.findMany({
        where: { userId: session.user!.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { userId: session.user!.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sample.findMany({
        where: { userId: session.user!.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.launch.findMany({
        where: { userId: session.user!.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return { suppliers, manufacturers, products, samples, launches };
}

export async function createSupplier(data: {
  name: string;
  type: string;
  country?: string;
  city?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: string;
  moq?: number;
  leadTime?: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const supplier = await prisma.supplier.create({
    data: { userId: session.user!.id, ...data },
  });

  revalidatePath("/ovier");
  return { success: true, supplier };
}

export async function updateSupplierStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const supplier = await prisma.supplier.update({
    where: { id, userId: session.user.id },
    data: { status },
  });

  revalidatePath("/ovier");
  return { success: true, supplier };
}

export async function createManufacturer(data: {
  name: string;
  country?: string;
  city?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: string;
  moq?: number;
  leadTime?: number;
  capabilities?: string[];
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const manufacturer = await prisma.manufacturer.create({
    data: { userId: session.user!.id, ...data },
  });

  revalidatePath("/ovier");
  return { success: true, manufacturer };
}

export async function createSample(data: {
  productId?: string;
  supplierId?: string;
  round: number;
  status?: string;
  cost?: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const sample = await prisma.sample.create({
    data: { userId: session.user!.id, ...data },
  });

  revalidatePath("/ovier");
  return { success: true, sample };
}

export async function updateSampleStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const sample = await prisma.sample.update({
    where: { id, userId: session.user.id },
    data: { status },
  });

  revalidatePath("/ovier");
  return { success: true, sample };
}

export async function getOvierMetrics() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const metrics = await prisma.businessMetric.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: 50,
  });

  return metrics;
}

export async function logBusinessMetric(data: {
  category: string;
  metric: string;
  value: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const metric = await prisma.businessMetric.create({
    data: {
      userId: session.user!.id,
      date: new Date(),
      ...data,
    },
  });

  revalidatePath("/ovier");
  return { success: true, metric };
}

// Pre-populate Batch 001 products for new users
export async function seedBatch001() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const userId = session.user.id as string;

  const existing = await prisma.product.findFirst({
    where: { userId },
  });
  if (existing) return { success: true, message: "Already seeded" };

  const skus = [
    { sku: "CHALK-SF-S", colour: "Chalk", construction: "pique", fit: "SF", size: "S", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "CHALK-SF-M", colour: "Chalk", construction: "pique", fit: "SF", size: "M", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "NOIR-SF-S", colour: "Noir", construction: "pique", fit: "SF", size: "S", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "NOIR-SF-M", colour: "Noir", construction: "pique", fit: "SF", size: "M", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "DUSK-SF-M", colour: "Dusk", construction: "pique", fit: "SF", size: "M", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "HAZE-SF-M", colour: "Haze", construction: "pique", fit: "SF", size: "M", gsm: 220, sellPrice: 4200, costPrice: 1400 },
    { sku: "EMBER-RF-M", colour: "Ember", construction: "flat-knit", fit: "RF", size: "M", gsm: 220, sellPrice: 4500, costPrice: 1400 },
    { sku: "OCHRE-RF-M", colour: "Ochre", construction: "flat-knit", fit: "RF", size: "M", gsm: 220, sellPrice: 4500, costPrice: 1400 },
  ];

  await prisma.product.createMany({
    data: skus.map((s) => ({
      userId,
      name: `Ovier Polo — ${s.colour}`,
      cotton: "Combed Ring-Spun",
      margin: ((s.sellPrice - s.costPrice) / s.sellPrice) * 100,
      status: "development",
      ...s,
    })),
  });

  revalidatePath("/ovier");
  return { success: true };
}
