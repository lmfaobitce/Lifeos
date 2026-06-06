"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai/ai-chat";
import { createJournalEntry, getJournalEntries, deleteJournalEntry } from "@/lib/actions/journal";
import { BookMarked, Plus, X, Trash2, Smile, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Entry = Awaited<ReturnType<typeof getJournalEntries>>[number];
type Tab = "write" | "entries";
type JournalType = "daily" | "reflection" | "gratitude" | "weekly";

const PROMPTS: Record<JournalType, string[]> = {
  daily: [
    "What are the 3 most important things I need to do today?",
    "How am I feeling right now, honestly?",
    "What's one thing I'm grateful for this morning?",
    "What would make today a great day?",
  ],
  reflection: [
    "What did I learn today?",
    "What could I have done better?",
    "What am I proud of?",
    "What patterns am I noticing in myself?",
  ],
  gratitude: [
    "3 things I'm genuinely grateful for today:",
    "Someone who made a positive difference recently:",
    "A small moment that brought me joy:",
    "Something about myself I appreciate:",
  ],
  weekly: [
    "What were my biggest wins this week?",
    "What didn't go as planned and why?",
    "What do I want to focus on next week?",
    "How am I progressing toward my goals?",
  ],
};

export default function JournalPage() {
  const [tab, setTab] = useState<Tab>("write");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Form
  const [type, setType] = useState<JournalType>("daily");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  async function load() {
    const data = await getJournalEntries(50);
    setEntries(data);
  }

  useEffect(() => { load(); }, []);

  function handleSave() {
    if (!content.trim()) return;
    startTransition(async () => {
      await createJournalEntry({ date, type, content, mood, energy });
      setContent("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteJournalEntry(id);
      if (selectedEntry?.id === id) setSelectedEntry(null);
      load();
    });
  }

  const avgMood = entries.length > 0
    ? (entries.reduce((a, e) => a + (e.mood ?? 0), 0) / entries.filter(e => e.mood).length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Journal" subtitle="Daily · Reflection · Gratitude · Weekly" />

      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex gap-2 max-w-5xl mx-auto">
          {(["write", "entries"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-[#1C2B3A] text-[#F2EDE4]" : "text-[#9A8E7E] hover:text-[#1C2B3A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {tab === "write" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
                <p className="text-2xl font-bold text-[#1C2B3A]">{entries.length}</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Total Entries</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
                <p className="text-2xl font-bold text-[#1C2B3A]">{avgMood ?? "—"}</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Avg Mood</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
                <p className="text-2xl font-bold text-[#1C2B3A]">
                  {entries.filter(e => {
                    const d = new Date(e.date);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-xs text-[#9A8E7E] mt-1">This Month</p>
              </div>
            </div>

            {/* Write area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type selector */}
                <div className="flex gap-2 flex-wrap">
                  {(["daily", "reflection", "gratitude", "weekly"] as JournalType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                        type === t
                          ? "bg-[#1C2B3A] text-[#F2EDE4]"
                          : "bg-[#F2EDE4] text-[#9A8E7E] hover:text-[#1C2B3A]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Prompts */}
                <div className="bg-[#F2EDE4] rounded-xl p-4">
                  <p className="text-xs font-medium text-[#9A8E7E] mb-2">Prompts</p>
                  <ul className="space-y-1">
                    {PROMPTS[type].map((p, i) => (
                      <li key={i} className="text-xs text-[#1C2B3A]">• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 py-2 text-sm text-[#1C2B3A] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Entry</Label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Start writing your ${type} entry...`}
                    rows={8}
                    className="w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 py-2 text-sm text-[#1C2B3A] placeholder:text-[#9A8E7E] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20 resize-none leading-relaxed"
                  />
                </div>

                {/* Mood & Energy sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5" /> Mood
                      </Label>
                      <span className="text-sm font-semibold text-[#1C2B3A]">{mood}/10</span>
                    </div>
                    <input
                      type="range" min={1} max={10} value={mood}
                      onChange={e => setMood(parseInt(e.target.value))}
                      className="w-full accent-[#1C2B3A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> Energy
                      </Label>
                      <span className="text-sm font-semibold text-[#1C2B3A]">{energy}/10</span>
                    </div>
                    <input
                      type="range" min={1} max={10} value={energy}
                      onChange={e => setEnergy(parseInt(e.target.value))}
                      className="w-full accent-[#1C2B3A]"
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={!content.trim() || isPending} className="w-full">
                  {saved ? "Saved ✓" : "Save Entry"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {tab === "entries" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Entry list */}
            <div className="lg:col-span-1 space-y-2">
              {entries.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <BookMarked className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#9A8E7E]">No entries yet</p>
                </div>
              ) : (
                entries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedEntry?.id === entry.id
                        ? "bg-[#1C2B3A] border-[#1C2B3A]"
                        : "bg-white border-[#1C2B3A]/10 hover:border-[#1C2B3A]/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium capitalize ${selectedEntry?.id === entry.id ? "text-[#C09240]" : "text-[#9A8E7E]"}`}>
                        {entry.type}
                      </span>
                      <span className={`text-xs ${selectedEntry?.id === entry.id ? "text-[#9A8E7E]" : "text-[#9A8E7E]"}`}>
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${selectedEntry?.id === entry.id ? "text-[#F2EDE4]" : "text-[#1C2B3A]"}`}>
                      {entry.content.slice(0, 100)}...
                    </p>
                    {(entry.mood || entry.energy) && (
                      <div className="flex gap-2 mt-1.5">
                        {entry.mood && (
                          <span className={`text-[10px] ${selectedEntry?.id === entry.id ? "text-[#9A8E7E]" : "text-[#9A8E7E]"}`}>
                            😊 {entry.mood}/10
                          </span>
                        )}
                        {entry.energy && (
                          <span className={`text-[10px] ${selectedEntry?.id === entry.id ? "text-[#9A8E7E]" : "text-[#9A8E7E]"}`}>
                            ⚡ {entry.energy}/10
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Entry detail */}
            <div className="lg:col-span-2">
              {selectedEntry ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{selectedEntry.type}</Badge>
                          <span className="text-xs text-[#9A8E7E]">{formatDate(selectedEntry.date)}</span>
                        </div>
                        {(selectedEntry.mood || selectedEntry.energy) && (
                          <div className="flex gap-3">
                            {selectedEntry.mood && <span className="text-xs text-[#9A8E7E]">Mood: {selectedEntry.mood}/10</span>}
                            {selectedEntry.energy && <span className="text-xs text-[#9A8E7E]">Energy: {selectedEntry.energy}/10</span>}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(selectedEntry.id)}
                        className="text-[#9A8E7E] hover:text-[#8B3A3A]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#1C2B3A] leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <p className="text-[#9A8E7E] text-sm">Select an entry to read it</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AIChat hub="journal" />
    </div>
  );
}
