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
  createAssignment, getAssignments, updateAssignmentStatus,
  addGrade, getGrades,
} from "@/lib/actions/university";
import { calculateDegreeClass } from "@/lib/utils";
import { GraduationCap, Plus, X, BookOpen, Award, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Assignment = Awaited<ReturnType<typeof getAssignments>>[number];
type Grade = Awaited<ReturnType<typeof getGrades>>[number];
type Tab = "assignments" | "grades" | "classification";

const STATUS_COLOURS: Record<string, string> = {
  pending: "outline",
  "in-progress": "warning",
  submitted: "ovier",
  graded: "success",
};

const MODULE_GRADE_BOUNDARY = { first: 70, twoOne: 60, twoTwo: 50, third: 40 };

export default function UniversityPage() {
  const [tab, setTab] = useState<Tab>("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Assignment form
  const [aTitle, setATitle] = useState("");
  const [aModule, setAModule] = useState("");
  const [aType, setAType] = useState("essay");
  const [aDue, setADue] = useState("");
  const [aWeight, setAWeight] = useState("");

  // Grade form
  const [gModule, setGModule] = useState("");
  const [gYear, setGYear] = useState("2");
  const [gGrade, setGGrade] = useState("");
  const [gCredits, setGCredits] = useState("20");

  async function load() {
    const [a, g] = await Promise.all([getAssignments(), getGrades()]);
    setAssignments(a);
    setGrades(g);
  }

  useEffect(() => { load(); }, []);

  function handleAddAssignment() {
    if (!aTitle.trim() || !aModule.trim()) return;
    startTransition(async () => {
      await createAssignment({
        title: aTitle, module: aModule, type: aType,
        dueDate: aDue || undefined, weight: aWeight ? parseFloat(aWeight) : undefined,
      });
      setATitle(""); setAModule(""); setADue(""); setAWeight("");
      setShowAdd(false); load();
    });
  }

  function handleAddGrade() {
    if (!gModule.trim() || !gGrade) return;
    startTransition(async () => {
      await addGrade({
        module: gModule, year: parseInt(gYear),
        grade: parseFloat(gGrade), credits: gCredits ? parseInt(gCredits) : undefined,
      });
      setGModule(""); setGGrade("");
      setShowAddGrade(false); load();
    });
  }

  function handleStatus(id: string, status: string) {
    startTransition(async () => {
      await updateAssignmentStatus(id, status);
      load();
    });
  }

  // Stats
  const pending = assignments.filter(a => a.status === "pending").length;
  const upcoming = assignments.filter(a => a.dueDate && new Date(a.dueDate) > new Date()).slice(0, 3);

  // Classification calculation
  const gradeData = grades.filter(g => g.credits).map(g => ({ grade: g.grade, credits: g.credits! }));
  const degreeClass = calculateDegreeClass(gradeData);
  const weightedAvg = gradeData.length > 0
    ? (gradeData.reduce((a, g) => a + g.grade * g.credits, 0) / gradeData.reduce((a, g) => a + g.credits, 0)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="University" subtitle="York Business School · Year 2 · 2025–26" />

      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex gap-2">
            {(["assignments", "grades", "classification"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-[#1C2B3A] text-[#F2EDE4]" : "text-[#9A8E7E] hover:text-[#1C2B3A]"
                }`}>{t}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => tab === "grades" ? setShowAddGrade(true) : setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
            <p className="text-2xl font-bold text-[#1C2B3A]">{pending}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
            <p className="text-2xl font-bold text-[#1C2B3A]">{weightedAvg ?? "—"}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Avg Grade</p>
          </div>
          <div className="bg-[#1C2B3A] rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-[#C09240]">{degreeClass === "N/A" ? "—" : degreeClass.split(" ")[0]}</p>
            <p className="text-xs text-[#9A8E7E] mt-1">Classification</p>
          </div>
        </div>

        {/* Assignments Tab */}
        {tab === "assignments" && (
          <>
            {showAdd && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">New Assignment</CardTitle>
                    <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-[#9A8E7E]" /></button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Title *</Label>
                      <Input placeholder="Assignment title" value={aTitle} onChange={e => setATitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Module *</Label>
                      <Input placeholder="MAN00001M" value={aModule} onChange={e => setAModule(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <select value={aType} onChange={e => setAType(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none">
                        {["essay", "exam", "presentation", "project", "report", "other"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Due Date</Label>
                      <Input type="date" value={aDue} onChange={e => setADue(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Weight (%)</Label>
                      <Input type="number" placeholder="50" value={aWeight} onChange={e => setAWeight(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleAddAssignment} disabled={!aTitle.trim() || !aModule.trim() || isPending} className="w-full">
                    Add Assignment
                  </Button>
                </CardContent>
              </Card>
            )}

            {upcoming.length > 0 && (
              <div className="bg-[#1C2B3A] rounded-xl p-4">
                <p className="text-[#F2EDE4] text-sm font-medium mb-3">Upcoming Deadlines</p>
                <div className="space-y-2">
                  {upcoming.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div>
                        <p className="text-[#F2EDE4] text-sm">{a.title}</p>
                        <p className="text-[#9A8E7E] text-xs">{a.module}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#C09240] text-xs font-medium">{a.dueDate ? formatDate(a.dueDate) : "—"}</p>
                        {a.weight && <p className="text-[#9A8E7E] text-xs">{a.weight}%</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <BookOpen className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#9A8E7E]">No assignments yet</p>
                </div>
              ) : assignments.map(a => (
                <div key={a.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#1C2B3A]">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#9A8E7E]">{a.module}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
                        {a.weight && <span className="text-xs text-[#9A8E7E]">{a.weight}%</span>}
                      </div>
                      {a.dueDate && (
                        <p className="text-xs text-[#9A8E7E] mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due {formatDate(a.dueDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={a.status}
                        onChange={e => handleStatus(a.id, e.target.value)}
                        className="text-xs border border-[#1C2B3A]/20 rounded-lg px-2 py-1 text-[#1C2B3A] bg-white focus:outline-none"
                      >
                        {["pending", "in-progress", "submitted", "graded"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {a.grade && <span className="text-sm font-semibold text-emerald-600">{a.grade}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Grades Tab */}
        {tab === "grades" && (
          <>
            {showAddGrade && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Add Grade</CardTitle>
                    <button onClick={() => setShowAddGrade(false)}><X className="w-4 h-4 text-[#9A8E7E]" /></button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Module *</Label>
                      <Input placeholder="Business Strategy" value={gModule} onChange={e => setGModule(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Year</Label>
                      <select value={gYear} onChange={e => setGYear(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none">
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Grade (%)</Label>
                      <Input type="number" min={0} max={100} placeholder="68" value={gGrade} onChange={e => setGGrade(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Credits</Label>
                      <Input type="number" placeholder="20" value={gCredits} onChange={e => setGCredits(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleAddGrade} disabled={!gModule.trim() || !gGrade || isPending} className="w-full">
                    Add Grade
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {grades.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <Award className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#9A8E7E]">No grades recorded yet</p>
                </div>
              ) : grades.map(g => (
                <div key={g.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1C2B3A]">{g.module}</p>
                    <p className="text-xs text-[#9A8E7E]">Year {g.year} · {g.credits ?? "?"} credits</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      g.grade >= 70 ? "text-emerald-600" :
                      g.grade >= 60 ? "text-[#1C2B3A]" :
                      g.grade >= 50 ? "text-[#C4783C]" : "text-[#8B3A3A]"
                    }`}>{g.grade}%</p>
                    <p className="text-xs text-[#9A8E7E]">
                      {g.grade >= 70 ? "First" : g.grade >= 60 ? "2:1" : g.grade >= 50 ? "2:2" : "Third"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Classification Tab */}
        {tab === "classification" && (
          <div className="space-y-4">
            <div className="bg-[#1C2B3A] rounded-2xl p-6 text-center">
              <p className="text-[#9A8E7E] text-sm mb-2">Projected Classification</p>
              <p className="text-3xl font-bold text-[#C09240] mb-1">{degreeClass}</p>
              {weightedAvg && <p className="text-[#F2EDE4] text-sm">Weighted Average: {weightedAvg}%</p>}
              <p className="text-[#9A8E7E] text-xs mt-2">University of York · Business Management · May 2027</p>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Grade Boundaries (UK)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "First Class", range: "70%+", colour: "text-emerald-600", current: weightedAvg ? parseFloat(weightedAvg) >= 70 : false },
                    { label: "Upper Second (2:1)", range: "60–69%", colour: "text-[#1C2B3A]", current: weightedAvg ? parseFloat(weightedAvg) >= 60 && parseFloat(weightedAvg) < 70 : false },
                    { label: "Lower Second (2:2)", range: "50–59%", colour: "text-[#C4783C]", current: weightedAvg ? parseFloat(weightedAvg) >= 50 && parseFloat(weightedAvg) < 60 : false },
                    { label: "Third Class", range: "40–49%", colour: "text-[#8B3A3A]", current: false },
                  ].map(b => (
                    <div key={b.label} className={`flex items-center justify-between p-3 rounded-xl ${b.current ? "bg-[#1C2B3A]/5 border border-[#1C2B3A]/20" : "bg-[#F2EDE4]"}`}>
                      <div className="flex items-center gap-2">
                        {b.current && <div className="w-2 h-2 rounded-full bg-[#C09240]" />}
                        <span className="text-sm text-[#1C2B3A]">{b.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${b.colour}`}>{b.range}</span>
                    </div>
                  ))}
                </div>
                {weightedAvg && parseFloat(weightedAvg) < 70 && (
                  <div className="mt-4 p-3 bg-[#C09240]/10 rounded-xl">
                    <p className="text-xs text-[#1C2B3A]">
                      <span className="font-semibold">To reach First Class:</span> need{" "}
                      {(70 - parseFloat(weightedAvg)).toFixed(1)}% more on weighted average.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AIChat hub="university" />
    </div>
  );
}
