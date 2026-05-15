"use client";

import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { AuthPanel } from "./auth-panel";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const Header = () => {
  const { token, setToken } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-4 transition-transform active:scale-95">
          <div className="neural-glow flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <BrainCircuit size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Reddit.Neural</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Neural Social Fabric</p>
          </div>
        </Link>
        {token && (
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <AuthPanel token={token} onToken={setToken} />
          </div>
        )}

      </div>
    </header>
  );
};
