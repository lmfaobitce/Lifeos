"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai/ai-chat";
import { createNote, getNotes, updateNote, deleteNote, togglePin } from "@/lib/actions/notes";
import { FileText, Plus, X, Search, Pin, PinOff, Trash2, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Note = Awaited<ReturnType<typeof getNotes>>[number];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // New note form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  // Edit state
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  async function load(q?: string) {
    const data = await getNotes(q);
    setNotes(data);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search]);

  function selectNote(note: Note) {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsDirty(false);
    setShowNew(false);
  }

  function handleCreate() {
    if (!newTitle.trim() || !newContent.trim()) return;
    startTransition(async () => {
      const tags = newTags.split(",").map(t => t.trim()).filter(Boolean);
      const result = await createNote({ title: newTitle, content: newContent, tags });
      if (result.success) {
        setNewTitle(""); setNewContent(""); setNewTags("");
        setShowNew(false);
        await load();
        if (result.note) selectNote(result.note as Note);
      }
    });
  }

  function handleSave() {
    if (!selectedNote || !isDirty) return;
    startTransition(async () => {
      await updateNote(selectedNote.id, { title: editTitle, content: editContent });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsDirty(false);
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
      load();
    });
  }

  function handlePin(id: string, pinned: boolean) {
    startTransition(async () => {
      await togglePin(id, !pinned);
      load();
    });
  }

  // Group by pinned
  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Notes" subtitle="Your knowledge base" />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {/* Search + new */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A8E7E]" />
                <Input
                  placeholder="Search notes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button size="icon" onClick={() => { setShowNew(true); setSelectedNote(null); }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {pinned.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-[#9A8E7E] uppercase tracking-wider px-1">Pinned</p>
                  {pinned.map(note => <NoteItem key={note.id} note={note} selected={selectedNote?.id === note.id} onSelect={selectNote} onPin={handlePin} onDelete={handleDelete} />)}
                  {unpinned.length > 0 && <p className="text-[10px] font-semibold text-[#9A8E7E] uppercase tracking-wider px-1 pt-2">All Notes</p>}
                </>
              )}
              {unpinned.map(note => <NoteItem key={note.id} note={note} selected={selectedNote?.id === note.id} onSelect={selectNote} onPin={handlePin} onDelete={handleDelete} />)}
              {notes.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <FileText className="w-6 h-6 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-xs text-[#9A8E7E]">{search ? "No results" : "No notes yet"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {showNew ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">New Note</CardTitle>
                    <button onClick={() => setShowNew(false)}><X className="w-4 h-4 text-[#9A8E7E]" /></button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-3">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input placeholder="Note title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tags (comma separated)</Label>
                    <Input placeholder="ovier, strategy, ideas..." value={newTags} onChange={e => setNewTags(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <Label>Content</Label>
                    <textarea
                      placeholder="Start writing..."
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      className="flex-1 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 py-2 text-sm text-[#1C2B3A] placeholder:text-[#9A8E7E] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20 resize-none leading-relaxed"
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={!newTitle.trim() || !newContent.trim() || isPending} className="w-full">
                    Create Note
                  </Button>
                </CardContent>
              </Card>
            ) : selectedNote ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      value={editTitle}
                      onChange={e => { setEditTitle(e.target.value); setIsDirty(true); }}
                      className="border-0 shadow-none text-base font-semibold p-0 focus:ring-0 bg-transparent"
                    />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isDirty && (
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                          <Save className="w-3 h-3 mr-1" />
                          {saved ? "Saved!" : "Save"}
                        </Button>
                      )}
                      <button onClick={() => handlePin(selectedNote.id, selectedNote.pinned)} className="text-[#9A8E7E] hover:text-[#1C2B3A]">
                        {selectedNote.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(selectedNote.id)} className="text-[#9A8E7E] hover:text-[#8B3A3A]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#9A8E7E]">{formatDate(selectedNote.updatedAt)}</span>
                    {selectedNote.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <textarea
                    value={editContent}
                    onChange={e => { setEditContent(e.target.value); setIsDirty(true); }}
                    className="flex-1 w-full bg-transparent text-sm text-[#1C2B3A] leading-relaxed resize-none focus:outline-none"
                    style={{ minHeight: "400px" }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full bg-white rounded-xl border border-[#1C2B3A]/10">
                <div className="text-center">
                  <FileText className="w-10 h-10 text-[#1C2B3A]/20 mx-auto mb-3" />
                  <p className="text-[#9A8E7E] text-sm">Select a note or create a new one</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowNew(true)}>
                    <Plus className="w-3 h-3 mr-1" /> New Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AIChat hub="notes" />
    </div>
  );
}

function NoteItem({
  note, selected, onSelect, onPin, onDelete
}: {
  note: Note;
  selected: boolean;
  onSelect: (n: Note) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(note)}
      className={`w-full text-left p-3 rounded-xl border transition-all group ${
        selected ? "bg-[#1C2B3A] border-[#1C2B3A]" : "bg-white border-[#1C2B3A]/10 hover:border-[#1C2B3A]/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${selected ? "text-[#F2EDE4]" : "text-[#1C2B3A]"}`}>
            {note.pinned && <span className="mr-1">📌</span>}
            {note.title}
          </p>
          <p className={`text-xs truncate mt-0.5 ${selected ? "text-[#9A8E7E]" : "text-[#9A8E7E]"}`}>
            {note.content.slice(0, 60)}
          </p>
          <p className={`text-[10px] mt-1 ${selected ? "text-[#9A8E7E]" : "text-[#9A8E7E]"}`}>
            {formatDate(note.updatedAt)}
          </p>
        </div>
      </div>
    </button>
  );
}
