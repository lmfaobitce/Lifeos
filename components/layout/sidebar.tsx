"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Target,
  GraduationCap,
  BookOpen,
  FileText,
  BookMarked,
  BarChart3,
  Sparkles,
  Package,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fitness", href: "/fitness", icon: Dumbbell },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "University", href: "/university", icon: GraduationCap },
  { label: "Learning", href: "/learning", icon: BookOpen },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Journal", href: "/journal", icon: BookMarked },
  { label: "Ovier", href: "/ovier", icon: Package },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1C2B3A] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C09240] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[#F2EDE4] font-semibold text-sm tracking-widest">
              LIFEOS
            </p>
            <p className="text-[#9A8E7E] text-xs">Personal OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-[#F2EDE4]"
                    : "text-[#9A8E7E] hover:bg-white/5 hover:text-[#F2EDE4]"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.label === "Ovier" && (
                  <span className="ml-auto text-[10px] bg-[#C09240] text-white px-1.5 py-0.5 rounded-full font-medium">
                    BIZ
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A8E7E] hover:bg-white/5 hover:text-[#F2EDE4] transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
