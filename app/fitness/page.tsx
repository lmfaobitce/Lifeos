"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai/ai-chat";
import {
  logBodyWeight,
  logWorkout,
  logNutrition,
  getBodyWeights,
  getWorkouts,
  getNutritionLogs,
  getFitnessStats,
} from "@/lib/actions/fitness";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Dumbbell, Scale, Zap, Plus, Check, TrendingDown, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { WorkoutPlan } from "@/components/fitness/workout-plan";
import { WorkoutSession } from "@/components/fitness/workout-session";
import { GymEquipment } from "@/components/fitness/gym-equipment";
import { getActivePlan, getTodayWorkout, getGymEquipment } from "@/lib/actions/workout";


type Tab = "overview" | "weight" | "workouts" | "nutrition" | "plan" | "equipment";


export default function FitnessPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isPending, startTransition] = useTransition();

  // Weight state
  const [weightVal, setWeightVal] = useState("");
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightNotes, setWeightNotes] = useState("");

  // Workout state
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState("strength");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutCalories, setWorkoutCalories] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0]);

  // Nutrition state
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [nutritionDate, setNutritionDate] = useState(new Date().toISOString().split("T")[0]);

  // Data
  const [weights, setWeights] = useState<Array<{ weight: number; date: Date; id: string; notes: string | null; userId: string; createdAt: Date }>>([]);
  const [workouts, setWorkouts] = useState<Array<{ id: string; name: string; type: string; duration: number; calories: number | null; date: Date; notes: string | null; userId: string; createdAt: Date }>>([]);
  const [nutrition, setNutrition] = useState<Array<{ id: string; calories: number | null; protein: number | null; carbs: number | null; fat: number | null; water: number | null; date: Date; notes: string | null; userId: string; createdAt: Date }>>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [gymEquipment, setGymEquipment] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [stats, setStats] = useState<{
    currentWeight: number | null;
    weeklyWorkouts: number;
    avgCalories: number | null;
    avgProtein: number | null;
    weights: Array<{ weight: number; date: Date; id: string; notes: string | null; userId: string; createdAt: Date }>;
  } | null>(null);

  const [weightSuccess, setWeightSuccess] = useState(false);
  const [workoutSuccess, setWorkoutSuccess] = useState(false);
  const [nutritionSuccess, setNutritionSuccess] = useState(false);

  async function loadData() {
    const [w, wo, n, s] = await Promise.all([
      getBodyWeights(30),
      getWorkouts(20),
      getNutritionLogs(30),
      getFitnessStats(),
    ]);
    setWeights(w);
    setWorkouts(wo);
    setNutrition(n);
    setStats(s);
    const [ap, tw, ge] = await Promise.all([getActivePlan(), getTodayWorkout(), getGymEquipment()]);
    setActivePlan(ap);
    setTodayWorkout(tw);
    setGymEquipment(ge);

  }

  useEffect(() => {
    loadData();
  }, []);

  const weightChartData = [...weights]
    .reverse()
    .slice(-14)
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      weight: w.weight,
    }));

  const handleLogWeight = () => {
    if (!weightVal) return;
    startTransition(async () => {
      const result = await logBodyWeight({
        weight: parseFloat(weightVal),
        date: weightDate,
        notes: weightNotes || undefined,
      });
      if (result.success) {
        setWeightSuccess(true);
        setWeightVal("");
        setWeightNotes("");
        setTimeout(() => setWeightSuccess(false), 2000);
        loadData();
      }
    });
  };

  const handleLogWorkout = () => {
    if (!workoutName || !workoutDuration) return;
    startTransition(async () => {
      const result = await logWorkout({
        name: workoutName,
        type: workoutType,
        duration: parseInt(workoutDuration),
        calories: workoutCalories ? parseInt(workoutCalories) : undefined,
        date: workoutDate,
      });
      if (result.success) {
        setWorkoutSuccess(true);
        setWorkoutName("");
        setWorkoutDuration("");
        setWorkoutCalories("");
        setTimeout(() => setWorkoutSuccess(false), 2000);
        loadData();
      }
    });
  };

  const handleLogNutrition = () => {
    startTransition(async () => {
      const result = await logNutrition({
        date: nutritionDate,
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
      });
      if (result.success) {
        setNutritionSuccess(true);
        setTimeout(() => setNutritionSuccess(false), 2000);
        loadData();
      }
    });
  };

  const weightTrend =
    weights.length >= 2
      ? weights[0].weight - weights[Math.min(6, weights.length - 1)].weight
      : null;

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Fitness Hub" subtitle="Track your body, workouts & nutrition" />

      {/* Tabs */}
      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex gap-2 max-w-6xl mx-auto overflow-x-auto">
          {(["overview", "weight", "workouts", "nutrition", "plan", "equipment"] as Tab[]).map((t) => (

            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                tab === t
                  ? "bg-[#1C2B3A] text-[#F2EDE4]"
                  : "text-[#9A8E7E] hover:text-[#1C2B3A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Overview Tab */}
        {tab === "overview" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                <Scale className="w-5 h-5 text-[#1C2B3A] mb-3" />
                <p className="text-2xl font-bold text-[#1C2B3A]">
                  {stats?.currentWeight ?? "—"}
                  {stats?.currentWeight && <span className="text-sm font-normal text-[#9A8E7E]">kg</span>}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-[#9A8E7E]">Current Weight</p>
                  {weightTrend !== null && (
                    <span className={`text-xs font-medium ${weightTrend < 0 ? "text-emerald-600" : "text-[#8B3A3A]"}`}>
                      {weightTrend > 0 ? "+" : ""}{weightTrend.toFixed(1)}kg
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                <Dumbbell className="w-5 h-5 text-[#1C2B3A] mb-3" />
                <p className="text-2xl font-bold text-[#1C2B3A]">{stats?.weeklyWorkouts ?? 0}</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Workouts / Week</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                <Zap className="w-5 h-5 text-[#C09240] mb-3" />
                <p className="text-2xl font-bold text-[#1C2B3A]">{stats?.avgCalories ?? "—"}</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Avg Calories / Day</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-3" />
                <p className="text-2xl font-bold text-[#1C2B3A]">
                  {stats?.avgProtein ?? "—"}
                  {stats?.avgProtein && <span className="text-sm font-normal text-[#9A8E7E]">g</span>}
                </p>
                <p className="text-xs text-[#9A8E7E] mt-1">Avg Protein / Day</p>
              </div>
            </div>

            {/* Weight chart */}
            {weightChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weight History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightChartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9A8E7E" }} />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 11, fill: "#9A8E7E" }}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1C2B3A",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F2EDE4",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#1C2B3A"
                        strokeWidth={2}
                        dot={{ fill: "#1C2B3A", r: 3 }}
                        activeDot={{ r: 5, fill: "#C09240" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent workouts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Workouts</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setTab("workouts")}>
                    <Plus className="w-3 h-3 mr-1" /> Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <p className="text-[#9A8E7E] text-sm text-center py-4">No workouts logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {workouts.slice(0, 5).map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-2 border-b border-[#1C2B3A]/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#1C2B3A]">{w.name}</p>
                          <p className="text-xs text-[#9A8E7E]">{formatDate(w.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{w.type}</Badge>
                          <span className="text-sm text-[#9A8E7E]">{w.duration}min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Weight Tab */}
        {tab === "weight" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Weight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={weightVal}
                    onChange={(e) => setWeightVal(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={weightDate}
                    onChange={(e) => setWeightDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Input
                    placeholder="Morning weight, post-workout..."
                    value={weightNotes}
                    onChange={(e) => setWeightNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleLogWeight}
                  disabled={!weightVal || isPending}
                  className="w-full"
                >
                  {weightSuccess ? (
                    <><Check className="w-4 h-4 mr-2" /> Logged!</>
                  ) : (
                    "Log Weight"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {weights.length === 0 ? (
                    <p className="text-[#9A8E7E] text-sm text-center py-4">No entries yet</p>
                  ) : (
                    weights.map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-2 border-b border-[#1C2B3A]/5 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-[#1C2B3A]">{w.weight} kg</p>
                          {w.notes && <p className="text-xs text-[#9A8E7E]">{w.notes}</p>}
                        </div>
                        <p className="text-xs text-[#9A8E7E]">{formatDate(w.date)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {weightChartData.length > 1 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">14-Day Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weightChartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9A8E7E" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#9A8E7E" }} width={35} />
                      <Tooltip
                        contentStyle={{
                          background: "#1C2B3A",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F2EDE4",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#C09240" strokeWidth={2} dot={{ fill: "#C09240", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Workouts Tab */}
        {tab === "workouts" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Workout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Workout Name</Label>
                  <Input placeholder="Push Day, Morning Run..." value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 py-2 text-sm text-[#1C2B3A] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sport">Sport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Duration (min)</Label>
                    <Input type="number" placeholder="60" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Calories (opt.)</Label>
                    <Input type="number" placeholder="400" value={workoutCalories} onChange={(e) => setWorkoutCalories(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
                </div>
                <Button onClick={handleLogWorkout} disabled={!workoutName || !workoutDuration || isPending} className="w-full">
                  {workoutSuccess ? <><Check className="w-4 h-4 mr-2" /> Logged!</> : "Log Workout"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workout History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {workouts.length === 0 ? (
                    <p className="text-[#9A8E7E] text-sm text-center py-4">No workouts logged yet</p>
                  ) : (
                    workouts.map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-[#1C2B3A]/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#1C2B3A]">{w.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{w.type}</Badge>
                            <span className="text-xs text-[#9A8E7E]">{formatDate(w.date)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1C2B3A]">{w.duration}min</p>
                          {w.calories && <p className="text-xs text-[#9A8E7E]">{w.calories} kcal</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Nutrition Tab */}
        {tab === "nutrition" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Nutrition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={nutritionDate} onChange={(e) => setNutritionDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Calories</Label>
                    <Input type="number" placeholder="2200" value={calories} onChange={(e) => setCalories(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Protein (g)</Label>
                    <Input type="number" placeholder="160" value={protein} onChange={(e) => setProtein(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Carbs (g)</Label>
                    <Input type="number" placeholder="220" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fat (g)</Label>
                    <Input type="number" placeholder="70" value={fat} onChange={(e) => setFat(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleLogNutrition} disabled={isPending} className="w-full">
                  {nutritionSuccess ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Nutrition"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nutrition Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nutrition.length === 0 ? (
                    <p className="text-[#9A8E7E] text-sm text-center py-4">No nutrition logged yet</p>
                  ) : (
                    nutrition.map((n) => (
                      <div key={n.id} className="py-2.5 border-b border-[#1C2B3A]/5 last:border-0">
                        <p className="text-xs text-[#9A8E7E] mb-1.5">{formatDate(n.date)}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Cal", value: n.calories },
                            { label: "Pro", value: n.protein ? `${n.protein}g` : null },
                            { label: "Carb", value: n.carbs ? `${n.carbs}g` : null },
                            { label: "Fat", value: n.fat ? `${n.fat}g` : null },
                          ].map((item) => (
                            <div key={item.label} className="bg-[#F2EDE4] rounded-lg p-2 text-center">
                              <p className="text-xs text-[#9A8E7E]">{item.label}</p>
                              <p className="text-xs font-semibold text-[#1C2B3A]">{item.value ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
          {tab === "plan" && (
            activeSession ? (
              <WorkoutSession session={activeSession} onComplete={() => { setActiveSession(null); loadData(); }} />
            ) : (
              <WorkoutPlan initialPlan={activePlan} todayWorkout={todayWorkout} onSessionStart={setActiveSession} />
            )
          )}

          {tab === "equipment" && (
            <GymEquipment initialEquipment={gymEquipment} />
          )}

      <AIChat hub="fitness" />
    </div>
  );
}
