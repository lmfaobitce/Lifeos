import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIChat } from "@/components/ai/ai-chat";
import {
  Dumbbell,
  Target,
  Package,
  TrendingUp,
  Calendar,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Ovier Batch 001 checklist
const ovierMilestones = [
  { label: "Domain & Shopify", done: true },
  { label: "Instagram @ovierofficial", done: true },
  { label: "Brand Brief V5", done: true },
  { label: "Financial Model", done: true },
  { label: "Trademark Class 25", done: false },
  { label: "Google Workspace", done: false },
  { label: "Designer (Shreshthi meeting)", done: false },
  { label: "Manufacturer shortlist", done: false },
  { label: "Piqué sample round 1", done: false },
  { label: "Flat-knit sample round 1", done: false },
  { label: "Batch 001 production", done: false },
  { label: "Launch day", done: false },
];

export default async function DashboardPage() {
  const session = await auth();
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

  // Fetch stats
  const [
    activeGoals,
    weekWorkouts,
    latestWeight,
    latestNutrition,
  ] = await Promise.all([
    prisma.goal.count({
      where: { userId: session!.user!.id, status: "active" },
    }),
    prisma.workout.count({
      where: {
        userId: session!.user!.id,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.bodyWeight.findFirst({
      where: { userId: session!.user!.id },
      orderBy: { date: "desc" },
    }),
    prisma.nutritionLog.findFirst({
      where: { userId: session!.user!.id },
      orderBy: { date: "desc" },
    }),
  ]);

  const completedMilestones = ovierMilestones.filter((m) => m.done).length;
  const ovierProgress = Math.round((completedMilestones / ovierMilestones.length) * 100);

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header
        title={`${greeting}, ${session?.user?.name?.split(" ")[0] ?? "Shaurya"}`}
        subtitle={today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      />

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Active Goals"
            value={activeGoals.toString()}
            sub="in progress"
            color="noir"
          />
          <StatCard
            icon={<Dumbbell className="w-5 h-5" />}
            label="Workouts"
            value={weekWorkouts.toString()}
            sub="this week"
            color="noir"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Weight"
            value={latestWeight ? `${latestWeight.weight}kg` : "—"}
            sub={latestWeight ? formatDate(latestWeight.date) : "not logged"}
            color="noir"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Calories"
            value={latestNutrition?.calories ? `${latestNutrition.calories}` : "—"}
            sub={latestNutrition ? "today" : "not logged"}
            color="gold"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ovier Launch Progress */}
          <Card className="border-[#C09240]/20 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#C09240]/10 rounded-md flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-[#C09240]" />
                  </div>
                  <CardTitle className="text-base">Ovier — Batch 001</CardTitle>
                </div>
                <Link href="/ovier" className="text-xs text-[#9A8E7E] hover:text-[#1C2B3A] flex items-center gap-1">
                  View Hub <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#9A8E7E]">Launch Progress</span>
                  <span className="font-semibold text-[#1C2B3A]">{ovierProgress}%</span>
                </div>
                <Progress value={ovierProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                {ovierMilestones.slice(0, 6).map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.done ? "bg-emerald-500" : "bg-[#1C2B3A]/10"
                    }`}>
                      {m.done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${m.done ? "text-[#9A8E7E] line-through" : "text-[#1C2B3A]"}`}>
                      {m.label}
                    </span>
                    {!m.done && i === ovierMilestones.filter(x => !x.done).indexOf(m) && (
                      <Badge variant="ovier" className="ml-auto text-[10px]">Next</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#1C2B3A]/10 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-[#9A8E7E]">Target Price</p>
                  <p className="text-sm font-semibold text-[#1C2B3A]">₹4,200</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#9A8E7E]">Margin</p>
                  <p className="text-sm font-semibold text-emerald-600">69%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#9A8E7E]">Batch Size</p>
                  <p className="text-sm font-semibold text-[#1C2B3A]">400 pcs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* India Trip Countdown */}
          <Card className="bg-[#1C2B3A] border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C09240]" />
                <CardTitle className="text-base text-[#F2EDE4]">India Trip — June 2026</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { day: "Day 1", task: "Father meeting — Ovier pitch", urgent: true },
                  { day: "Day 2", task: "Trademark agent — Class 25 filing", urgent: true },
                  { day: "Day 3", task: "Mill conversation with family", urgent: false },
                  { day: "Day 4", task: "Post Naukri job + Google Workspace", urgent: false },
                  { day: "Week 2", task: "Designer meetings (Shreshthi confirmed)", urgent: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[10px] font-medium text-[#C09240] bg-[#C09240]/10 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                      {item.day}
                    </span>
                    <span className="text-sm text-[#F2EDE4]/80">{item.task}</span>
                    {item.urgent && (
                      <Badge className="ml-auto bg-[#8B3A3A]/20 text-[#F2EDE4]/60 border-0 text-[10px]">
                        Urgent
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[#9A8E7E] text-xs">
                  Seed requirement: <span className="text-[#C09240] font-semibold">₹6,38,000</span> · Year 1 target: <span className="text-[#C09240] font-semibold">₹29L</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fitness Quick Log + Goals */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#1C2B3A]" />
                  <CardTitle className="text-base">Fitness This Week</CardTitle>
                </div>
                <Link href="/fitness" className="text-xs text-[#9A8E7E] hover:text-[#1C2B3A] flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F2EDE4] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">{weekWorkouts}</p>
                  <p className="text-xs text-[#9A8E7E] mt-1">Workouts</p>
                </div>
                <div className="bg-[#F2EDE4] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">
                    {latestWeight?.weight ?? "—"}
                    {latestWeight && <span className="text-sm font-normal text-[#9A8E7E]">kg</span>}
                  </p>
                  <p className="text-xs text-[#9A8E7E] mt-1">Current Weight</p>
                </div>
                <div className="bg-[#F2EDE4] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">
                    {latestNutrition?.protein ?? "—"}
                    {latestNutrition?.protein && <span className="text-sm font-normal text-[#9A8E7E]">g</span>}
                  </p>
                  <p className="text-xs text-[#9A8E7E] mt-1">Protein Today</p>
                </div>
                <div className="bg-[#F2EDE4] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">
                    {latestNutrition?.calories ?? "—"}
                  </p>
                  <p className="text-xs text-[#9A8E7E] mt-1">Calories Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1C2B3A]" />
                  <CardTitle className="text-base">Active Goals</CardTitle>
                </div>
                <Link href="/goals" className="text-xs text-[#9A8E7E] hover:text-[#1C2B3A] flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {activeGoals === 0 ? (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#9A8E7E]">No active goals yet</p>
                  <Link href="/goals" className="text-xs text-[#1C2B3A] underline mt-1 inline-block">
                    Add your first goal
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-[#1C2B3A]">{activeGoals}</p>
                  <p className="text-sm text-[#9A8E7E] mt-1">goals in progress</p>
                  <Link
                    href="/goals"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-[#1C2B3A] hover:underline"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AIChat hub="dashboard" />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "noir" | "gold";
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
        color === "gold" ? "bg-[#C09240]/10 text-[#C09240]" : "bg-[#1C2B3A]/5 text-[#1C2B3A]"
      }`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-[#1C2B3A]">{value}</p>
      <p className="text-xs text-[#9A8E7E] mt-0.5">{sub}</p>
      <p className="text-xs font-medium text-[#1C2B3A]/60 mt-1">{label}</p>
    </div>
  );
}
