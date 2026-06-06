"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIChat } from "@/components/ai/ai-chat";
import {
  createGoal, getGoals, updateGoalProgress,
  updateGoalStatus, deleteGoal, createMilestone, toggleMilestone,
} from "@/lib/actions/goals";
import {
  Target, Plus, X, Check, ChevronDown, ChevronUp,
  Trash2, Circle, CheckCircle2, TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type Goal = Awaited<ReturnType<typeof getGoals>>[number];
type Tab = "all" | "annual" | "quarterly" | "monthly" | "weekly";

const CATEGORIES = ["personal", "fitness", "university", "business", "learning", "health", "financial"];
const TIMEFRAMES = ["annual", "quarterly", "monthly", "weekly"];

const CATEGORY_COLOURS: Record<string, string> = {
  personal: "#1C2B3A",
  fitness: "#2D6A4F",
  university: "#1D3557",
  business: "#C09240",
  learning: "#6B4226",
  health: "#4A7C59",
  financial: "#8B3A3A",
};

export default function GoalsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [timeframe, setTimeframe] = useState("quarterly");
  const [targetDate, setTargetDate] = useState("");

  // Milestone add
  const [milestoneGoalId, setMilestoneGoalId] = useState<string | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  async function load() {
    const data = await getGoals();
    setGoals(data);
  }

  useEffect(() => { load(); }, []);

  const filtered = tab === "all" ? goals : goals.filter(g => g.timeframe === tab);
  const active = goals.filter(g => g.status === "active").length;
  const completed = goals.filter(g => g.status === "completed").length;

  function handleAdd() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createGoal({ title, description: description || undefined, category, timeframe, targetDate: targetDate || undefined });
      setTitle(""); setDescription(""); setTargetDate(""); setShowAdd(false);
      load();
    });
  }

  function handleProgress(id: string, progress: number) {
    startTransition(async () => {
      await updateGoalProgress(id, progress);
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteGoal(id);
      load();
    });
  }

  function handleAddMilestone(goalId: string) {
    if (!milestoneTitle.trim()) return;
    startTransition(async () => {
      await createMilestone(goalId, milestoneTitle);
      setMilestoneTitle("");
      setMilestoneGoalId(null);
      load();
    });
  }

  function handleToggleMilestone(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleMilestone(id, !completed);
      load();
    });
  }

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Goals" subtitle="Annual · Quarterly · Monthly · Weekly" />

      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "annual", "quarterly", "monthly", "weekly"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                  tab === t ? "bg-[#1C2B3A] text-[#F2EDE4]" : "text-[#9A8E7E] hover:text-[#1C2B3A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)} className="flex-shrink-0">
            <Plus className="w-3 h-3 mr-1" /> Add Goal
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
            <p className="text-2xl font-bold text-[#1C2B3A]">{goals.length}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Total Goals</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
            <p className="text-2xl font-bold text-[#1C2B3A]">{active}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completed}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Completed</p>
          </div>
        </div>

        {/* Add Goal Form */}
        {showAdd && (
          <Card className="border-[#1C2B3A]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New Goal</CardTitle>
                <button onClick={() => setShowAdd(false)}>
                  <X className="w-4 h-4 text-[#9A8E7E]" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Goal *</Label>
                <Input placeholder="What do you want to achieve?" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Why does this matter?" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20 capitalize"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Timeframe</Label>
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20 capitalize"
                  >
                    {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Target Date (optional)</Label>
                <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={!title.trim() || isPending} className="w-full">
                Create Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Goals list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#1C2B3A]/10">
            <Target className="w-10 h-10 text-[#1C2B3A]/20 mx-auto mb-3" />
            <p className="text-[#9A8E7E]">No {tab === "all" ? "" : tab} goals yet</p>
            <button onClick={() => setShowAdd(true)} className="text-sm text-[#1C2B3A] underline mt-2">
              Add your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(goal => {
              const isExpanded = expandedId === goal.id;
              const completedMilestones = goal.milestones.filter((m: { completed: boolean }) => m.completed).length;
              return (
                <div key={goal.id} className="bg-white rounded-xl border border-[#1C2B3A]/10 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Category dot */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: CATEGORY_COLOURS[goal.category] ?? "#9A8E7E" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#1C2B3A]">{goal.title}</p>
                            {goal.description && (
                              <p className="text-xs text-[#9A8E7E] mt-0.5">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-[10px] capitalize">{goal.timeframe}</Badge>
                            <Badge variant={goal.status === "completed" ? "success" : goal.status === "paused" ? "warning" : "secondary"} className="text-[10px] capitalize">
                              {goal.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-[#9A8E7E]">Progress</span>
                            <span className="text-xs font-semibold text-[#1C2B3A]">{Math.round(goal.progress)}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-1.5" />
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={goal.progress}
                            onChange={e => handleProgress(goal.id, parseInt(e.target.value))}
                            className="w-full mt-2 accent-[#1C2B3A]"
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            {goal.targetDate && (
                              <span className="text-xs text-[#9A8E7E]">
                                Due {formatDate(goal.targetDate)}
                              </span>
                            )}
                            {goal.milestones.length > 0 && (
                              <span className="text-xs text-[#9A8E7E]">
                                {completedMilestones}/{goal.milestones.length} milestones
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                              className="text-xs text-[#9A8E7E] hover:text-[#1C2B3A] flex items-center gap-1"
                            >
                              Milestones {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="text-[#9A8E7E] hover:text-[#8B3A3A] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones panel */}
                  {isExpanded && (
                    <div className="border-t border-[#1C2B3A]/10 p-4 bg-[#F2EDE4]/50">
                      <div className="space-y-2 mb-3">
                        {goal.milestones.length === 0 ? (
                          <p className="text-xs text-[#9A8E7E]">No milestones yet. Add your first.</p>
                        ) : (
                          goal.milestones.map((m: { id: string; completed: boolean; completedAt: Date | null; title: string }) => (
                            <div key={m.id} className="flex items-center gap-2.5">
                              <button onClick={() => handleToggleMilestone(m.id, m.completed)}>
                                {m.completed
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  : <Circle className="w-4 h-4 text-[#1C2B3A]/30" />
                                }
                              </button>
                              <span className={`text-sm flex-1 ${m.completed ? "line-through text-[#9A8E7E]" : "text-[#1C2B3A]"}`}>
                                {m.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {milestoneGoalId === goal.id ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Milestone title..."
                            value={milestoneTitle}
                            onChange={e => setMilestoneTitle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAddMilestone(goal.id)}
                            className="text-sm"
                          />
                          <Button size="sm" onClick={() => handleAddMilestone(goal.id)} disabled={!milestoneTitle.trim() || isPending}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setMilestoneGoalId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setMilestoneGoalId(goal.id)}
                          className="text-xs text-[#9A8E7E] hover:text-[#1C2B3A] flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add milestone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AIChat hub="goals" />
    </div>
  );
}
