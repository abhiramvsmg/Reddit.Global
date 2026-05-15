"use client";

import { BrainCircuit, Fingerprint, LockKeyhole, ScanSearch, ShieldCheck, Sparkles, UserRoundPlus, Cpu, Activity, Zap } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { motion } from "framer-motion";

type Props = {
  message?: string;
  onToken: (token: string | null) => void;
};

export function AuthScreen({ message, onToken }: Props) {
  return (
    <main className="min-h-screen bg-paper relative overflow-hidden">
      {/* Background Neural Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl content-center gap-12 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <section className="flex flex-col justify-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex w-fit items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
              <Activity size={14} />
              Neural Interface v4.0
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-tight text-white sm:text-7xl tracking-tighter">
                The Future of <br />
                <span className="text-cyan-500">Social Intelligence.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                Connect your node to the global neural network. Experience community engagement augmented by real-time AI insights, proactive moderation, and high-fidelity social protocols.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <div className="glass-card rounded-3xl border border-white/5 p-6 hover:border-cyan-500/30 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <ScanSearch size={22} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Neural Scan</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">Context-aware post analysis and real-time safety signaling.</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/5 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Fingerprint size={22} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bio-Sync</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">Secure JWT-based session management with role encryption.</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/5 p-6 hover:border-rose-500/30 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Zap size={22} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quick Pulse</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">High-frequency social streaming with instant feedback loops.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              <Cpu size={14} /> Hardware Accelerated
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              <ShieldCheck size={14} /> End-to-End Encryption
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              <Sparkles size={14} /> Generative Augmentation
            </div>
          </motion.div>
        </section>

        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col justify-center gap-6"
        >
          {message && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-400 backdrop-blur-xl">
              {message}
            </div>
          )}
          <AuthPanel token={null} onToken={onToken} />
        </motion.section>
      </div>
    </main>
  );
}

