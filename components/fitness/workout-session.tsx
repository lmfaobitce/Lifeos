"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logSet, completeWorkoutSession } from "@/lib/actions/workout";
import { Check, ChevronDown, ChevronUp, Timer, Trophy } from "lucide-react";

interface Set {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

interface SessionExercise {
  id: string;
  order: number;
  exercise: { id: string; name: string; muscleGroup: string; instructions: string | null };
  sets: Set[];
}

interface WorkoutSession {
  id: string;
  name: string;
  exercises: SessionExercise[];
}

interface Props {
  session: WorkoutSession;
  onComplete: () => void;
}

export function WorkoutSession({ session, onComplete }: Props) {
  const [exercises, setExercises] = useState(session.exercises);
  const [expandedEx, setExpandedEx] = useState<string>(session.exercises[0]?.id ?? "");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    const t = setTimeout(() => setRestTimer((r) => (r ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  async function handleLogSet(exId: string, setId: string, weight: number, reps: number) {
    await logSet(setId, { weight, reps, completed: true });
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.map((s) => s.id === setId ? { ...s, weight, reps, completed: true } : s) }
          : ex
      )
    );
    setRestTimer(90);
  }

  async function handleComplete() {
    setCompleting(true);
    const duration = Math.floor((Date.now() - startTime) / 60000);
    await completeWorkoutSession(session.id, duration);
    onComplete();
  }

  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const completedSets = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.completed).length, 0);
  const progress = Math.round((completedSets / totalSets) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#F2EDE4] text-xl font-bold">{session.name}</h2>
          <p className="text-[#9A8E7E] text-sm">{formatTime(elapsed)} · {completedSets}/{totalSets} sets</p>
        </div>
        <div className="text-right">
          <div className="text-[#C9A84C] text-2xl font-bold">{progress}%</div>
          <div className="text-[#9A8E7E] text-xs">complete</div>
        </div>
      </div>

      <div className="w-full bg-[#1C2B3A] rounded-full h-2">
        <div className="bg-[#C9A84C] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {restTimer !== null && (
        <Card className="bg-[#1C2B3A] border-[#C9A84C]/50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-[#F2EDE4] text-sm">Rest Timer</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#C9A84C] text-xl font-bold">{formatTime(restTimer)}</span>
              <button onClick={() => setRestTimer(null)} className="text-[#9A8E7E] text-xs">Skip</button>
            </div>
          </CardContent>
        </Card>
      )}

      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          expanded={expandedEx === ex.id}
          onToggle={() => setExpandedEx(expandedEx === ex.id ? "" : ex.id)}
          onLogSet={(setId, weight, reps) => handleLogSet(ex.id, setId, weight, reps)}
        />
      ))}

      {progress === 100 && (
        <Button
          onClick={handleComplete}
          disabled={completing}
          className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/80 text-[#0F1923] font-bold py-4"
        >
          <Trophy className="w-5 h-5 mr-2" />
          {completing ? "Saving..." : "Complete Workout"}
        </Button>
      )}

      {progress < 100 && (
        <button onClick={handleComplete} className="w-full text-[#9A8E7E] text-sm py-2">
          End workout early
        </button>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, expanded, onToggle, onLogSet }: {
  exercise: SessionExercise;
  expanded: boolean;
  onToggle: () => void;
  onLogSet: (setId: string, weight: number, reps: number) => void;
}) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string }>>(
    Object.fromEntries(exercise.sets.map((s) => [s.id, { weight: "", reps: "" }]))
  );

  return (
    <Card className="bg-[#1C2B3A] border-[#1C2B3A]">
      <CardContent className="p-0">
        <button onClick={onToggle} className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              completedSets === exercise.sets.length ? "bg-[#C9A84C] text-[#0F1923]" : "bg-[#0F1923] text-[#9A8E7E]"
            }`}>
              {completedSets === exercise.sets.length ? <Check className="w-4 h-4" /> : completedSets}
            </div>
            <div className="text-left">
              <p className="text-[#F2EDE4] text-sm font-medium">{exercise.exercise.name}</p>
              <p className="text-[#9A8E7E] text-xs">{completedSets}/{exercise.sets.length} sets</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#9A8E7E]" /> : <ChevronDown className="w-4 h-4 text-[#9A8E7E]" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            {exercise.exercise.instructions && (
              <p className="text-[#9A8E7E] text-xs bg-[#0F1923]/50 p-2 rounded">{exercise.exercise.instructions}</p>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-[#9A8E7E] px-1">
              <span>Set</span><span>kg</span><span>Reps</span>
            </div>
            {exercise.sets.map((set) => (
              <div key={set.id} className="grid grid-cols-3 gap-2 items-center">
                <span className={`text-sm font-medium ${set.completed ? "text-[#C9A84C]" : "text-[#9A8E7E]"}`}>
                  {set.completed ? <Check className="w-4 h-4" /> : `Set ${set.setNumber}`}
                </span>
                <input
                  type="number"
                  placeholder={set.weight?.toString() ?? "kg"}
                  value={setInputs[set.id]?.weight ?? ""}
                  onChange={(e) => setSetInputs((prev) => ({ ...prev, [set.id]: { ...prev[set.id], weight: e.target.value } }))}
                  disabled={set.completed}
                  className="bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded p-1 text-sm text-center"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder={set.reps?.toString() ?? "reps"}
                    value={setInputs[set.id]?.reps ?? ""}
                    onChange={(e) => setSetInputs((prev) => ({ ...prev, [set.id]: { ...prev[set.id], reps: e.target.value } }))}
                    disabled={set.completed}
                    className="bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded p-1 text-sm text-center w-full"
                  />
                  {!set.completed && (
                    <button
                      onClick={() => {
                        const w = parseFloat(setInputs[set.id]?.weight ?? "0");
                        const r = parseInt(setInputs[set.id]?.reps ?? "0");
                        if (w >= 0 && r > 0) onLogSet(set.id, w, r);
                      }}
                      className="bg-[#C9A84C] text-[#0F1923] rounded p-1"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
