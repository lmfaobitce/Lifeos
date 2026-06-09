"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveGymEquipment } from "@/lib/actions/workout";
import { Check } from "lucide-react";

const DEFAULT_EQUIPMENT = [
  { name: "Dumbbells", category: "Free Weights" },
  { name: "Barbells", category: "Free Weights" },
  { name: "Smith Machine", category: "Machines" },
  { name: "Cable Machines", category: "Machines" },
  { name: "Chest Press Machine", category: "Machines" },
  { name: "Lat Pulldown", category: "Machines" },
  { name: "Seated Row", category: "Machines" },
  { name: "Leg Press", category: "Machines" },
  { name: "Hack Squat", category: "Machines" },
  { name: "Adjustable Benches", category: "Benches" },
  { name: "Pull-Up Station", category: "Bodyweight" },
];

interface Props {
  initialEquipment: { id: string; name: string; category: string; available: boolean }[];
}

export function GymEquipment({ initialEquipment }: Props) {
  const savedNames = initialEquipment.map((e) => e.name);
  const [selected, setSelected] = useState<string[]>(
    savedNames.length > 0 ? savedNames : DEFAULT_EQUIPMENT.map((e) => e.name)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customName, setCustomName] = useState("");

  const categories = [...new Set(DEFAULT_EQUIPMENT.map((e) => e.category))];

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function addCustom() {
    if (!customName.trim()) return;
    setSelected((prev) => [...prev, customName.trim()]);
    setCustomName("");
  }

  async function handleSave() {
    setSaving(true);
    const items = [
      ...DEFAULT_EQUIPMENT.filter((e) => selected.includes(e.name)),
      ...selected
        .filter((n) => !DEFAULT_EQUIPMENT.find((e) => e.name === n))
        .map((n) => ({ name: n, category: "Other" })),
    ];
    await saveGymEquipment(items);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#1C2B3A] border-[#1C2B3A]">
        <CardHeader>
          <CardTitle className="text-[#F2EDE4] text-base">Delhi Gym Equipment</CardTitle>
          <p className="text-[#9A8E7E] text-sm">Select what's available. AI will only program exercises you can do.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[#9A8E7E] text-xs uppercase tracking-wider mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_EQUIPMENT.filter((e) => e.category === cat).map((eq) => (
                  <button
                    key={eq.name}
                    onClick={() => toggle(eq.name)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selected.includes(eq.name)
                        ? "bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]"
                        : "bg-[#0F1923]/50 border-[#1C2B3A] text-[#9A8E7E]"
                    }`}
                  >
                    {selected.includes(eq.name) && <Check className="w-3 h-3 inline mr-1" />}
                    {eq.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[#9A8E7E] text-xs uppercase tracking-wider mb-2">Add Custom Equipment</p>
            <div className="flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="e.g. Preacher Curl Machine"
                className="flex-1 bg-[#0F1923] border border-[#1C2B3A]/50 text-[#F2EDE4] rounded-lg p-2 text-sm placeholder:text-[#9A8E7E]"
              />
              <Button onClick={addCustom} variant="outline" className="border-[#1C2B3A] text-[#9A8E7E]">
                Add
              </Button>
            </div>
            {selected.filter((n) => !DEFAULT_EQUIPMENT.find((e) => e.name === n)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selected
                  .filter((n) => !DEFAULT_EQUIPMENT.find((e) => e.name === n))
                  .map((n) => (
                    <Badge key={n} className="bg-[#1C2B3A] text-[#F2EDE4] cursor-pointer" onClick={() => toggle(n)}>
                      {n} ×
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/80 text-[#0F1923] font-semibold"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Equipment Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
