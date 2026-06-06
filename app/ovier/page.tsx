"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai/ai-chat";
import {
  getOvierDashboard,
  createSupplier,
  updateSupplierStatus,
  createManufacturer,
  createSample,
  updateSampleStatus,
  seedBatch001,
} from "@/lib/actions/ovier";
import {
  Package,
  Factory,
  Layers,
  TrendingUp,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  X,
  Palette,
} from "lucide-react";

type Tab = "overview" | "products" | "suppliers" | "manufacturers" | "samples";

const OVIER_COLOURS = {
  Chalk: "#F2EDE4",
  Noir: "#1C2B3A",
  Dusk: "#9A8E7E",
  Haze: "#C8D4D0",
  Ember: "#8B3A3A",
  Ochre: "#C4783C",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "outline" },
  contacted: { label: "Contacted", color: "warning" },
  sampling: { label: "Sampling", color: "ovier" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "destructive" },
  requested: { label: "Requested", color: "outline" },
  "in-transit": { label: "In Transit", color: "warning" },
  received: { label: "Received", color: "ovier" },
  development: { label: "In Development", color: "outline" },
};

type DashboardData = Awaited<ReturnType<typeof getOvierDashboard>>;

type OvierProduct = NonNullable<DashboardData>["products"][number];
type OvierSupplier = NonNullable<DashboardData>["suppliers"][number];
type OvierManufacturer = NonNullable<DashboardData>["manufacturers"][number];
type OvierSample = NonNullable<DashboardData>["samples"][number];

export default function OvierPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData>(null);
  const [isPending, startTransition] = useTransition();
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddManufacturer, setShowAddManufacturer] = useState(false);

  // Supplier form
  const [supName, setSupName] = useState("");
  const [supType, setSupType] = useState("mill");
  const [supCountry, setSupCountry] = useState("India");
  const [supCity, setSupCity] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supMoq, setSupMoq] = useState("");
  const [supNotes, setSupNotes] = useState("");

  // Manufacturer form
  const [mfgName, setMfgName] = useState("");
  const [mfgCountry, setMfgCountry] = useState("India");
  const [mfgCity, setMfgCity] = useState("");
  const [mfgContact, setMfgContact] = useState("");
  const [mfgEmail, setMfgEmail] = useState("");
  const [mfgMoq, setMfgMoq] = useState("");
  const [mfgNotes, setMfgNotes] = useState("");

  async function loadData() {
    const d = await getOvierDashboard();
    setData(d);
  }

  useEffect(() => {
    loadData();
    // Seed Batch 001 products on first load
    seedBatch001().then(loadData);
  }, []);

  const handleAddSupplier = () => {
    if (!supName) return;
    startTransition(async () => {
      await createSupplier({
        name: supName,
        type: supType,
        country: supCountry,
        city: supCity,
        contact: supContact,
        email: supEmail,
        moq: supMoq ? parseInt(supMoq) : undefined,
        notes: supNotes,
      });
      setShowAddSupplier(false);
      setSupName(""); setSupCity(""); setSupContact(""); setSupEmail(""); setSupMoq(""); setSupNotes("");
      loadData();
    });
  };

  const handleAddManufacturer = () => {
    if (!mfgName) return;
    startTransition(async () => {
      await createManufacturer({
        name: mfgName,
        country: mfgCountry,
        city: mfgCity,
        contact: mfgContact,
        email: mfgEmail,
        moq: mfgMoq ? parseInt(mfgMoq) : undefined,
        notes: mfgNotes,
      });
      setShowAddManufacturer(false);
      setMfgName(""); setMfgCity(""); setMfgContact(""); setMfgEmail(""); setMfgMoq(""); setMfgNotes("");
      loadData();
    });
  };

  const launchChecklist = [
    { label: "Domain (ovier.co)", done: true },
    { label: "Shopify setup", done: true },
    { label: "Instagram @ovierofficial", done: true },
    { label: "Brand Brief V5", done: true },
    { label: "Financial model", done: true },
    { label: "Trademark Class 25", done: false, urgent: true },
    { label: "Google Workspace (shaurya@ovier.co)", done: false, urgent: true },
    { label: "Designer hire (Shreshthi/FOD)", done: false },
    { label: "Manufacturer shortlist", done: false },
    { label: "Product + Sampling Manager hired", done: false, urgent: true },
    { label: "Piqué samples (Chalk + Noir)", done: false },
    { label: "Flat-knit samples (Ember + Ochre)", done: false },
    { label: "ISO 105 wash testing", done: false },
    { label: "Website (Framer)", done: false },
    { label: "Photography shoot", done: false },
    { label: "Batch 001 production (400 pcs)", done: false },
    { label: "Creator seeding (#spottedinovier)", done: false },
    { label: "Launch day 🚀", done: false },
  ];

  const done = launchChecklist.filter((i) => i.done).length;
  const progress = Math.round((done / launchChecklist.length) * 100);

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <Header title="Ovier" subtitle="Business Operating System — Batch 001" />

      {/* Tabs */}
      <div className="sticky top-[73px] z-20 bg-[#F2EDE4]/90 backdrop-blur border-b border-[#1C2B3A]/10 px-6 py-3">
        <div className="flex gap-2 max-w-6xl mx-auto overflow-x-auto">
          {(["overview", "products", "suppliers", "manufacturers", "samples"] as Tab[]).map((t) => (
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
      </div>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Overview Tab */}
        {tab === "overview" && (
          <>
            {/* Brand header */}
            <div className="bg-[#1C2B3A] rounded-2xl p-6 text-[#F2EDE4]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#C09240] text-xs font-medium tracking-widest mb-1">OVIER</p>
                  <h2 className="text-2xl font-semibold mb-1">Batch 001</h2>
                  <p className="text-[#9A8E7E] text-sm">400 pieces · 10 SKUs · 6 colours</p>
                </div>
                <div className="text-right">
                  <p className="text-[#9A8E7E] text-xs">Launch Progress</p>
                  <p className="text-3xl font-bold text-[#C09240]">{progress}%</p>
                </div>
              </div>

              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C09240] rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Financials */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg Price", value: "₹4,350" },
                  { label: "COGS", value: "₹1,400" },
                  { label: "Margin", value: "69%" },
                  { label: "Seed Req.", value: "₹6.38L" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-[#9A8E7E] text-xs">{m.label}</p>
                    <p className="text-[#F2EDE4] font-semibold mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colour palette */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <CardTitle className="text-base">Batch 001 — Colours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(OVIER_COLOURS).map(([name, hex]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-full aspect-square rounded-xl border border-[#1C2B3A]/10 mb-2"
                        style={{ backgroundColor: hex }}
                      />
                      <p className="text-xs font-medium text-[#1C2B3A]">{name}</p>
                      <p className="text-[10px] text-[#9A8E7E]">{hex}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-[#1C2B3A]/10">
                  <div className="bg-[#F2EDE4] rounded-xl p-3">
                    <p className="text-xs text-[#9A8E7E]">Piqué (SF)</p>
                    <p className="text-sm font-semibold text-[#1C2B3A]">Chalk, Noir, Dusk, Haze</p>
                    <p className="text-xs text-[#9A8E7E] mt-0.5">220gsm · 240 pcs · ₹4,200</p>
                  </div>
                  <div className="bg-[#F2EDE4] rounded-xl p-3">
                    <p className="text-xs text-[#9A8E7E]">Flat-Knit (RF)</p>
                    <p className="text-sm font-semibold text-[#1C2B3A]">Ember, Ochre</p>
                    <p className="text-xs text-[#9A8E7E] mt-0.5">220gsm · 160 pcs · ₹4,500</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Launch checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Launch Checklist</CardTitle>
                <CardDescription>{done} of {launchChecklist.length} complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {launchChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#1C2B3A]/20 flex-shrink-0" />
                      )}
                      <span className={`text-sm flex-1 ${item.done ? "line-through text-[#9A8E7E]" : "text-[#1C2B3A]"}`}>
                        {item.label}
                      </span>
                      {item.urgent && !item.done && (
                        <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* India trip */}
                <div className="mt-6 pt-4 border-t border-[#1C2B3A]/10">
                  <p className="text-xs font-semibold text-[#9A8E7E] uppercase tracking-wider mb-3">India Week 1 Sequence</p>
                  <div className="space-y-2">
                    {[
                      { day: "Day 1", task: "Father meeting — pitch with 0/53 polo stat" },
                      { day: "Day 2", task: "Trademark agent — Class 25 (₹4,500 + fee)" },
                      { day: "Day 3", task: "Mill conversation with family" },
                      { day: "Day 4", task: "Google Workspace + Naukri job post" },
                      { day: "Day 5", task: "Manufacturer shortlist" },
                      { day: "Week 2", task: "Shreshthi meeting (confirmed) + FOD" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[10px] font-medium bg-[#C09240]/10 text-[#C09240] rounded px-1.5 py-0.5 flex-shrink-0">
                          {item.day}
                        </span>
                        <span className="text-sm text-[#1C2B3A]">{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hiring pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiring Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      role: "Brand/Graphic Designer",
                      candidates: [
                        { name: "Shreshthi", status: "confirmed", contact: "hello@shreshthii.com" },
                        { name: "FOD (fondofdesigns.com)", status: "pending", contact: "enquiry@fondofdesigns.com" },
                      ],
                    },
                    {
                      role: "Product + Sampling Manager",
                      candidates: [{ name: "Naukri post (not yet live)", status: "blocked", contact: "Needs shaurya@ovier.co first" }],
                    },
                  ].map((pipeline, i) => (
                    <div key={i} className="bg-[#F2EDE4] rounded-xl p-4">
                      <p className="text-sm font-semibold text-[#1C2B3A] mb-2">{pipeline.role}</p>
                      <div className="space-y-1.5">
                        {pipeline.candidates.map((c, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-[#1C2B3A]">{c.name}</span>
                              <span className="text-xs text-[#9A8E7E] ml-2">{c.contact}</span>
                            </div>
                            <Badge
                              variant={c.status === "confirmed" ? "success" : c.status === "blocked" ? "destructive" : "warning"}
                            >
                              {c.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1C2B3A]">Batch 001 — SKU Grid</h2>
              <Badge variant="ovier">{data?.products.length ?? 0} SKUs</Badge>
            </div>
            <div className="grid gap-3">
              {(data?.products ?? []).map((product: OvierProduct) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#1C2B3A]/10"
                    style={{
                      backgroundColor:
                        OVIER_COLOURS[product.colour as keyof typeof OVIER_COLOURS] ?? "#F2EDE4",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1C2B3A] font-mono">{product.sku}</p>
                      <Badge variant="outline" className="text-[10px]">{product.construction}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{product.fit}</Badge>
                    </div>
                    <p className="text-xs text-[#9A8E7E] mt-0.5">
                      {product.gsm}gsm · {product.cotton} · Size {product.size}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#1C2B3A]">
                      ₹{product.sellPrice?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-emerald-600">{product.margin?.toFixed(0)}% margin</p>
                  </div>
                </div>
              ))}
              {(data?.products ?? []).length === 0 && (
                <div className="text-center py-8 text-[#9A8E7E] text-sm">Loading products...</div>
              )}
            </div>

            {/* Financial summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financial Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Year 1 Revenue", value: "₹29L", sub: "Target" },
                    { label: "Year 2 Revenue", value: "₹1.18Cr", sub: "Target" },
                    { label: "Year 3 Revenue", value: "₹2.16Cr", sub: "Target" },
                    { label: "LTV/CAC", value: "22x", sub: "Projected" },
                  ].map((m) => (
                    <div key={m.label} className="bg-[#F2EDE4] rounded-xl p-4 text-center">
                      <p className="text-lg font-bold text-[#1C2B3A]">{m.value}</p>
                      <p className="text-xs text-[#9A8E7E]">{m.label}</p>
                      <p className="text-[10px] text-[#9A8E7E]">{m.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-[#1C2B3A] rounded-xl">
                  <p className="text-[#F2EDE4] text-sm font-medium">Break-even Analysis</p>
                  <p className="text-[#9A8E7E] text-xs mt-1">
                    At 69% gross margin, break-even is <span className="text-[#C09240] font-semibold">39 polos/month</span> with ₹6,38,000 seed capital deployed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suppliers Tab */}
        {tab === "suppliers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1C2B3A]">Supplier Database</h2>
              <Button size="sm" onClick={() => setShowAddSupplier(true)}>
                <Plus className="w-3 h-3 mr-1" /> Add Supplier
              </Button>
            </div>

            {showAddSupplier && (
              <Card className="border-[#C09240]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Add Supplier</CardTitle>
                    <button onClick={() => setShowAddSupplier(false)}>
                      <X className="w-4 h-4 text-[#9A8E7E]" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Name *</Label>
                      <Input placeholder="Supplier name" value={supName} onChange={(e) => setSupName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <select
                        value={supType}
                        onChange={(e) => setSupType(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-[#1C2B3A]/20 bg-white px-3 text-sm text-[#1C2B3A] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20"
                      >
                        <option value="mill">Mill (Fabric)</option>
                        <option value="trim">Trim</option>
                        <option value="packaging">Packaging</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <Input value={supCountry} onChange={(e) => setSupCountry(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input placeholder="Delhi, Mumbai..." value={supCity} onChange={(e) => setSupCity(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Contact</Label>
                      <Input placeholder="Name" value={supContact} onChange={(e) => setSupContact(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@supplier.com" value={supEmail} onChange={(e) => setSupEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>MOQ (pieces)</Label>
                      <Input type="number" placeholder="100" value={supMoq} onChange={(e) => setSupMoq(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Input placeholder="IndiaMART listing, speciality, contact notes..." value={supNotes} onChange={(e) => setSupNotes(e.target.value)} />
                  </div>
                  <Button onClick={handleAddSupplier} disabled={!supName || isPending} className="w-full">
                    Add Supplier
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {(data?.suppliers ?? []).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[#1C2B3A]/10">
                  <Factory className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                  <p className="text-sm text-[#9A8E7E]">No suppliers added yet</p>
                  <p className="text-xs text-[#9A8E7E] mt-1">Add mills and fabric suppliers from IndiaMART research</p>
                </div>
              ) : (
                (data?.suppliers ?? []).map((s: OvierSupplier) => (
                  <div key={s.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[#1C2B3A]">{s.name}</p>
                        <p className="text-xs text-[#9A8E7E]">{s.city}{s.city && s.country ? ", " : ""}{s.country}</p>
                        {s.contact && <p className="text-xs text-[#9A8E7E]">{s.contact} {s.email ? `· ${s.email}` : ""}</p>}
                        {s.notes && <p className="text-xs text-[#9A8E7E] mt-1">{s.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="ovier">{s.type}</Badge>
                        <Badge variant={s.status === "approved" ? "success" : s.status === "rejected" ? "destructive" : "outline"}>
                          {s.status}
                        </Badge>
                        {s.moq && <p className="text-xs text-[#9A8E7E]">MOQ: {s.moq}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Manufacturers Tab */}
        {tab === "manufacturers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1C2B3A]">Manufacturer Database</h2>
              <Button size="sm" onClick={() => setShowAddManufacturer(true)}>
                <Plus className="w-3 h-3 mr-1" /> Add Manufacturer
              </Button>
            </div>

            {showAddManufacturer && (
              <Card className="border-[#C09240]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Add Manufacturer</CardTitle>
                    <button onClick={() => setShowAddManufacturer(false)}>
                      <X className="w-4 h-4 text-[#9A8E7E]" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Name *</Label>
                      <Input placeholder="Manufacturer name" value={mfgName} onChange={(e) => setMfgName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <Input value={mfgCountry} onChange={(e) => setMfgCountry(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input placeholder="Ludhiana, Tirupur..." value={mfgCity} onChange={(e) => setMfgCity(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Contact</Label>
                      <Input value={mfgContact} onChange={(e) => setMfgContact(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" value={mfgEmail} onChange={(e) => setMfgEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>MOQ (pieces)</Label>
                      <Input type="number" placeholder="200" value={mfgMoq} onChange={(e) => setMfgMoq(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Input placeholder="Capabilities, certifications, contact notes..." value={mfgNotes} onChange={(e) => setMfgNotes(e.target.value)} />
                  </div>
                  <Button onClick={handleAddManufacturer} disabled={!mfgName || isPending} className="w-full">
                    Add Manufacturer
                  </Button>
                </CardContent>
              </Card>
            )}

            {(data?.manufacturers ?? []).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#1C2B3A]/10">
                <Factory className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                <p className="text-sm text-[#9A8E7E]">No manufacturers added yet</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Target: Ludhiana (knit) or Tirupur (cotton polo)</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.manufacturers ?? []).map((m: OvierManufacturer) => (
                  <div key={m.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[#1C2B3A]">{m.name}</p>
                        <p className="text-xs text-[#9A8E7E]">{m.city}{m.city && m.country ? ", " : ""}{m.country}</p>
                        {m.notes && <p className="text-xs text-[#9A8E7E] mt-1">{m.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={m.status === "approved" ? "success" : "outline"}>{m.status}</Badge>
                        {m.moq && <p className="text-xs text-[#9A8E7E]">MOQ: {m.moq}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Samples Tab */}
        {tab === "samples" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1C2B3A]">Sample Tracking</h2>
            </div>

            <div className="bg-[#1C2B3A] rounded-xl p-4">
              <p className="text-[#F2EDE4] font-medium text-sm mb-1">Sampling Roadmap</p>
              <p className="text-[#9A8E7E] text-xs mb-3">Before committing to Batch 001 production</p>
              <div className="space-y-2">
                {[
                  { round: "Round 1", colours: "Chalk + Noir (Piqué), Ember + Ochre (Flat-knit)", status: "not-started" },
                  { round: "Round 2", colours: "Dusk + Haze (Piqué) — if Round 1 approved", status: "blocked" },
                  { round: "Lab Testing", colours: "ISO 105 wash test at NABL lab", status: "blocked" },
                  { round: "Full Approval", colours: "All 6 colours approved — production GO", status: "blocked" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                    <span className="text-[10px] font-medium bg-[#C09240]/20 text-[#C09240] rounded px-1.5 py-0.5 flex-shrink-0">
                      {r.round}
                    </span>
                    <span className="text-[#F2EDE4] text-xs flex-1">{r.colours}</span>
                  </div>
                ))}
              </div>
            </div>

            {(data?.samples ?? []).length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-[#1C2B3A]/10">
                <Layers className="w-8 h-8 text-[#1C2B3A]/20 mx-auto mb-2" />
                <p className="text-sm text-[#9A8E7E]">No samples tracked yet</p>
                <p className="text-xs text-[#9A8E7E] mt-1">Add manufacturers and suppliers first, then track samples</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.samples ?? []).map((s: OvierSample) => (
                  <div key={s.id} className="bg-white rounded-xl p-4 border border-[#1C2B3A]/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1C2B3A]">Round {s.round}</p>
                      <Badge variant="outline">{s.status}</Badge>
                    </div>
                    {s.cost && <p className="text-xs text-[#9A8E7E] mt-1">Cost: ₹{s.cost}</p>}
                    {s.feedback && <p className="text-xs text-[#9A8E7E] mt-1">{s.feedback}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AIChat hub="ovier" />
    </div>
  );
}
