"use client";

import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-[#F2EDE4]/80 backdrop-blur-md border-b border-[#1C2B3A]/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1C2B3A]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[#9A8E7E] mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg bg-white border border-[#1C2B3A]/10 flex items-center justify-center text-[#9A8E7E] hover:text-[#1C2B3A] transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-white border border-[#1C2B3A]/10 flex items-center justify-center text-[#9A8E7E] hover:text-[#1C2B3A] transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C09240] rounded-full" />
          </button>
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-9 h-9 rounded-lg object-cover border border-[#1C2B3A]/10"
            />
          )}
        </div>
      </div>
    </header>
  );
}
