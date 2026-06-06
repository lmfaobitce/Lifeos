import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
}

export function calculateMargin(cost: number, sell: number): number {
  return ((sell - cost) / sell) * 100;
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function calculateDegreeClass(grades: { grade: number; credits: number }[]): string {
  if (grades.length === 0) return "N/A";
  const totalCredits = grades.reduce((a, g) => a + g.credits, 0);
  if (totalCredits === 0) return "N/A";
  const weightedAvg = grades.reduce((a, g) => a + g.grade * g.credits, 0) / totalCredits;
  if (weightedAvg >= 70) return "First Class (1st)";
  if (weightedAvg >= 60) return "Upper Second (2:1)";
  if (weightedAvg >= 50) return "Lower Second (2:2)";
  if (weightedAvg >= 40) return "Third Class (3rd)";
  return "Below Pass";
}
