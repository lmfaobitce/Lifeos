"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateWorkoutPlan, getActivePlan, getTodayWorkout, startWorkoutSession } from "@/lib/actions/workout";
import { Dumbbell, Zap, ChevronRight, Play, RotateCcw } from "lucide-react";

interface Props {
  initialPlan: Awaited<ReturnType<typeof getActivePlan>>;
  todayWorkout: Awaited<ReturnType<typeof getTodayWorkout>>;
  onSessionStart: (session: any) => void;
}

const MUSCLE_COLORS: Record<string, string> = {
  Push: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Pull: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Legs: "bg-green-500/20 text-green-300 border-green-500/30",
  "Arms/Core": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Arms: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Core: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export function WorkoutPlan({ initialPlan, todayWorkout, onSessionStart }: Props) {
  const [plan, setPlan] = useState(initialPlan);
  const [today, setToday] = useState(todayWorkout);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showGenForm, setShowGenForm] = useState(!initialPlan);

  const [goal, setGoal] = useState("Body recomposition - fat loss while preserving muscle");
  const [experience, setExperience] = useState("intermediate");
  const [days, setDays] = useState(6);

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateWorkoutPlan({ goal, daysPerWeek: days, experienceLevel: experience });
    if (result.success) {
      const newPlan = await getActivePlan();
      const newToday = await getTodayWorkout();
      setPlan(newPlan);
      setToday(newToday);
      setShowGenForm(false);
    }
    setGenerating(false);
  }

  async function handleStartWorkout() {
    if (!today) return;
    setStarting(true);
    const result = await startWorkoutSession(today.id);
    if (result.success) onSessionStart(result.session);
    setStarting(false);
  }

  if (showGenForm) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#1C2B3A] border-[#1C2B3A]">
          <CardHeader>
            <CardTitle className="text-[#F2EDE4] text-lg">Generate Your Workout Plan</CardTitle>
            <p className="text-[#9A8E7E] text-sm">AI will create a personalised PPL split based on your goals and equipment</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-[#9A8E7E] text-sm">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full mt-1 bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded-lg p-2 text-sm"
              >
                <option value="Body recomposition - fat loss while preserving muscle">Body Recomposition</option>
                <option value="Muscle hypertrophy and size">Muscle Building</option>
                <option value="Fat loss while maintaining strength">Fat Loss</option>
                <option value="Strength and aesthetics">Strength + Aesthetics</option>
              </select>
            </div>
            <div>
              <label className="text-[#9A8E7E] text-sm">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-1 bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded-lg p-2 text-sm"
              >
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
              </select>
            </div>
            <div>
              <label className="text-[#9A8E7E] text-sm">Training Days Per Week</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full mt-1 bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded-lg p-2 text-sm"
              >
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
                <option value={6}>6 days</option>
              </select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/80 text-[#0F1923] font-semibold"
            >
              {generating ? "Generating Plan..." : "Generate AI Workout Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {today && (
        <Card className="bg-[#1C2B3A] border-[#C9A84C]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#9A8E7E] text-xs uppercase tracking-wider">Today's Workout</p>
                <h3 className="text-[#F2EDE4] text-xl font-bold">{today.label}</h3>
                <p className="text-[#9A8E7E] text-sm">{today.exercises.length} exercises · ~{today.estimatedMinutes} min</p>
              </div>
              <Badge className={MUSCLE_COLORS[today.label] ?? "bg-gray-500/20 text-gray-300"}>
                {today.label}
              </Badge>
            </div>
            <div className="space-y-2 mb-4">
              {today.exercises.slice(0, 4).map((ex) => (
                <div key={ex.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#F2EDE4]">{ex.exercise.name}</span>
                  <span className="text-[#9A8E7E]">{ex.sets} × {ex.repsMin}-{ex.repsMax}</span>
                </div>
              ))}
              {today.exercises.length > 4 && (
                <p className="text-[#9A8E7E] text-xs">+{today.exercises.length - 4} more exercises</p>
              )}
            </div>
            <Button
              onClick={handleStartWorkout}
              disabled={starting}
              className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/80 text-[#0F1923] font-semibold"
            >
              <Play className="w-4 h-4 mr-2" />
              {starting ? "Starting..." : "Start Workout"}
            </Button>
          </CardContent>
        </Card>
      )}

      {plan && (
        <Card className="bg-[#1C2B3A] border-[#1C2B3A]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#F2EDE4] text-base">{plan.name}</CardTitle>
              <button onClick={() => setShowGenForm(true)} className="text-[#9A8E7E] hover:text-[#C9A84C]">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#9A8E7E] text-xs">{plan.split} · {plan.weeks} weeks</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.plannedDays.map((day) => (
              <div key={day.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0F1923]/50">
                <div className="flex items-center gap-3">
                  <span className="text-[#9A8E7E] text-xs w-12">Day {day.dayNumber}</span>
                  <Badge className={`text-xs ${MUSCLE_COLORS[day.label] ?? "bg-gray-500/20 text-gray-300"}`}>
                    {day.label}
                  </Badge>
                </div>
                <span className="text-[#9A8E7E] text-xs">{day.exercises.length} exercises</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
