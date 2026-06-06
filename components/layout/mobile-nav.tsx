"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Target,
  Package,
  BarChart3,
} from "lucide-react";

const mobileNav = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fitness", href: "/fitness", icon: Dumbbell },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Ovier", href: "/ovier", icon: Package },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C2B3A] border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {mobileNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all",
                isActive ? "text-[#F2EDE4]" : "text-[#9A8E7E]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
