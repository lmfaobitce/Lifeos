"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai/ai-chat";
import { getLearningItems, createLearningItem, updateLearningStatus } from "@/lib/actions/learning";
import { BookOpen, Plus, X, ExternalLink } from "lucide-react";

type Item = Awaited<ReturnType<typeof getLearningItems>>[number];
type Tab = "all" | "want" | "reading" | "completed";

export default function LearningPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<Item[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lTitle, setLTitle] = useState("");
  const [lType, setLType] = useState("book");
  const [lCategory, setLCategory] = useState("");
  const [lUrl, setLUrl] = useState("");
  const [lNotes, setLNotes] = useState("");

  async function load() {
    const data = await getLearningItems();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  function handleAdd() {
    if (!lTitle.trim()) return;
    startTransition(async () => {
      await createLearningItem({ title: lTitle, type: lType, category: lCategory || undefined, url: lUrl || undefined, notes: lNotes || undefined });
      setLTitle(""); setLUrl(""); setLNotes(""); setLCategory("");
      setShowAdd(false); load();
    });
  }

  function handleStatus(id: string, status: string) {
    startTransition(async () => {
      await updateLearningStatus(id, status);
      load();
    });
  }

  const filtered = tab === "all" ? items : items.filter(i => i.status === tab);
  const TYPE_ICON: Record<string, string> = { book: "📚", article: "📰", video: "🎬", podcast: "🎙️", course: "🎓" };

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Learning" subtitle="Books · Articles · Courses · Podcasts" />

      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex gap-2">
            {(["all", "want", "reading", "completed"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-[#1C2B3A] text-[#F2EDE4]" : "text-[#9A8E7E] hover:text-[#1C2B3A]"
                }`}>{t}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Want", value: items.filter(i => i.status === "want").length },
            { label: "In Progress", value: items.filter(i => i.status === "reading").length },
            { label: "Completed", value: items.filter(i => i.status === "completed").length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 text-center">
              <p className="text-2xl font-bold text-[#1C2B3A]">{s.value}</p>
              <p className="text-xs text-[#9A8E7E] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {showAdd && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add to List</CardTitle>
                <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-[#9A8E7E]" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input placeholder="Book, article, course..." value={lTitle} onChange={e => setLTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select value={lType} onChange={e => setLType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none">
                    {["book", "article", "video", "podcast", "course"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input placeholder="business, design..." value={lCategory} onChange={e => setLCategory(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL (optional)</Label>
                <Input type="url" placeholder="https://..." value={lUrl} onChange={e => setLUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input placeholder="Why you want this..." value={lNotes} onChange={e => setLNotes(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={!lTitle.trim() || isPending} className="w-full">Add to List</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#1C2B3A]/10">
              <BookOpen className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
              <p className="text-sm text-[#9A8E7E]">Nothing here yet</p>
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{TYPE_ICON[item.type] ?? "📖"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#1C2B3A]">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] capitalize">{item.type}</Badge>
                      {item.category && <span className="text-xs text-[#9A8E7E]">{item.category}</span>}
                    </div>
                    {item.notes && <p className="text-xs text-[#9A8E7E] mt-1">{item.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#9A8E7E] hover:text-[#1C2B3A]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <select value={item.status} onChange={e => handleStatus(item.id, e.target.value)}
                      className="text-xs border border-[#1C2B3A]/20 rounded-lg px-2 py-1 text-[#1C2B3A] bg-white focus:outline-none">
                      <option value="want">Want</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AIChat hub="learning" />
    </div>
  );
}
