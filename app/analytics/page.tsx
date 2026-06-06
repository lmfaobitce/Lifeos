"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIChat } from "@/components/ai/ai-chat";
import { getBodyWeights, getWorkouts, getNutritionLogs } from "@/lib/actions/fitness";
import { getGoals } from "@/lib/actions/goals";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, Dumbbell, Target, Package } from "lucide-react";

type Tab = "fitness" | "goals" | "ovier";

const COLOURS = ["#1C2B3A", "#C09240", "#9A8E7E", "#8B3A3A", "#C4783C", "#C8D4D0"];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("fitness");
  const [weights, setWeights] = useState<Array<{ weight: number; date: Date }>>([]);
  const [workouts, setWorkouts] = useState<Array<{ type: string; duration: number; date: Date }>>([]);
  const [nutrition, setNutrition] = useState<Array<{ calories: number | null; protein: number | null; date: Date }>>([]);
  const [goals, setGoals] = useState<Array<{ category: string; status: string; progress: number; title: string }>>([]);

  useEffect(() => {
    async function load() {
      const [w, wo, n, g] = await Promise.all([
        getBodyWeights(60),
        getWorkouts(50),
        getNutritionLogs(30),
        getGoals(),
      ]);
      setWeights(w);
      setWorkouts(wo);
      setNutrition(n);
      setGoals(g);
    }
    load();
  }, []);

  // Weight chart data
  const weightData = [...weights].reverse().slice(-30).map(w => ({
    date: new Date(w.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    weight: w.weight,
  }));

  // Workout by type
  const workoutByType = workouts.reduce((acc: Record<string, number>, w) => {
    acc[w.type] = (acc[w.type] ?? 0) + 1;
    return acc;
  }, {});
  const workoutPieData = Object.entries(workoutByType).map(([name, value]) => ({ name, value }));

  // Nutrition 14-day
  const nutritionData = [...nutrition].reverse().slice(-14).map(n => ({
    date: new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    calories: n.calories ?? 0,
    protein: n.protein ?? 0,
  }));

  // Goals by category
  const goalsByCategory = goals.reduce((acc: Record<string, number>, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});
  const goalPieData = Object.entries(goalsByCategory).map(([name, value]) => ({ name, value }));

  // Goals progress
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
    : 0;

  // Weekly workout count (last 8 weeks)
  const weeklyWorkouts = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = workouts.filter(w => {
      const d = new Date(w.date);
      return d >= weekStart && d < weekEnd;
    }).length;
    return {
      week: `W${i + 1}`,
      workouts: count,
    };
  });

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Analytics" subtitle="Your personal performance data" />

      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex gap-2 max-w-5xl mx-auto">
          {(["fitness", "goals", "ovier"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-[#1C2B3A] text-[#F2EDE4]" : "text-[#9A8E7E] hover:text-[#1C2B3A]"
              }`}>{t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {tab === "fitness" && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Workouts", value: workouts.length },
                { label: "Weight Entries", value: weights.length },
                { label: "Nutrition Logs", value: nutrition.length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">{s.value}</p>
                  <p className="text-xs text-[#9A8E7E] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {weightData.length > 1 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Weight Trend (30 days)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9A8E7E" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#9A8E7E" }} width={35} />
                      <Tooltip contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="weight" stroke="#C09240" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#C09240" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {weeklyWorkouts.some(w => w.workouts > 0) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Weekly Workouts</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={weeklyWorkouts}>
                        <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9A8E7E" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#9A8E7E" }} width={25} />
                        <Tooltip contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }} />
                        <Bar dataKey="workouts" fill="#1C2B3A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {workoutPieData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Workout Types</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={workoutPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                          {workoutPieData.map((_, i) => (
                            <Cell key={i} fill={COLOURS[i % COLOURS.length]} />
                          ))}
                        </Pie>
                        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                        <Tooltip contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {nutritionData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Nutrition (14 days)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={nutritionData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9A8E7E" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9A8E7E" }} width={40} />
                      <Tooltip contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }} />
                      <Bar dataKey="calories" fill="#1C2B3A" radius={[3, 3, 0, 0]} name="Calories" />
                      <Bar dataKey="protein" fill="#C09240" radius={[3, 3, 0, 0]} name="Protein (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {weights.length === 0 && workouts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#1C2B3A]/10">
                <Dumbbell className="w-10 h-10 text-[#1C2B3A]/20 mx-auto mb-3" />
                <p className="text-[#9A8E7E]">Log some fitness data to see analytics</p>
              </div>
            )}
          </>
        )}

        {tab === "goals" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Goals", value: goals.length },
                { label: "Active", value: goals.filter(g => g.status === "active").length },
                { label: "Avg Progress", value: `${avgProgress}%` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
                  <p className="text-2xl font-bold text-[#1C2B3A]">{s.value}</p>
                  <p className="text-xs text-[#9A8E7E] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {goalPieData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Goals by Category</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={goalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                        {goalPieData.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                      </Pie>
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {goals.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Goal Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goals.slice(0, 8).map(g => (
                      <div key={g.title} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-[#1C2B3A] truncate flex-1 mr-2">{g.title}</span>
                          <span className="text-xs font-semibold text-[#1C2B3A] flex-shrink-0">{Math.round(g.progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1C2B3A]/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1C2B3A] rounded-full" style={{ width: `${g.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {goals.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#1C2B3A]/10">
                <Target className="w-10 h-10 text-[#1C2B3A]/20 mx-auto mb-3" />
                <p className="text-[#9A8E7E]">Add goals to see analytics</p>
              </div>
            )}
          </>
        )}

        {tab === "ovier" && (
          <div className="space-y-4">
            <div className="bg-[#1C2B3A] rounded-2xl p-6">
              <p className="text-[#C09240] text-xs font-medium tracking-widest mb-4">OVIER — BATCH 001 FINANCIALS</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Batch Size", value: "400 pcs" },
                  { label: "Avg ASP", value: "₹4,350" },
                  { label: "Gross Margin", value: "69%" },
                  { label: "Break-even", value: "39/mo" },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[#F2EDE4] font-bold">{m.value}</p>
                    <p className="text-[#9A8E7E] text-xs mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Projections</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { year: "Year 1", target: 2900000, label: "₹29L" },
                    { year: "Year 2", target: 11800000, label: "₹1.18Cr" },
                    { year: "Year 3", target: 21600000, label: "₹2.16Cr" },
                  ]}>
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9A8E7E" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9A8E7E" }} width={45} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip
                      contentStyle={{ background: "#1C2B3A", border: "none", borderRadius: "8px", color: "#F2EDE4", fontSize: "11px" }}
                      formatter={(value) => [`₹${((Number(value))/100000).toFixed(0)}L`, "Revenue"]}
                    />
                    <Bar dataKey="target" fill="#C09240" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Unit Economics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Piqué Polo ASP", value: "₹4,200", sub: "Chalk, Noir, Dusk, Haze" },
                    { label: "Flat-Knit Polo ASP", value: "₹4,500", sub: "Ember, Ochre" },
                    { label: "Average COGS", value: "₹1,400", sub: "Per unit" },
                    { label: "Gross Profit / Unit", value: "~₹2,900", sub: "Before ops costs" },
                    { label: "LTV / CAC", value: "22x", sub: "Projected" },
                    { label: "Seed Required", value: "₹6,38,000", sub: "Full deployment" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1C2B3A]/5 last:border-0">
                      <div>
                        <p className="text-sm text-[#1C2B3A]">{item.label}</p>
                        <p className="text-xs text-[#9A8E7E]">{item.sub}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1C2B3A]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AIChat hub="analytics" />
    </div>
  );
}
