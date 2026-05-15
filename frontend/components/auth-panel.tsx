"use client";

import { BrainCircuit, CheckCircle2, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, User, UserPlus, Fingerprint, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, AUTH_STORAGE_VERSION } from "@/lib/api";

type Props = {
  token: string | null;
  onToken: (token: string | null) => void;
};

export function AuthPanel({ token, onToken }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = ["Add a password", "Basic", "Better", "Strong", "Excellent"][strength];

  async function submit() {
    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);
    try {
      const payload =
        mode === "signup" ? { email, username, password } : { email, password };
      const result = await api<{ access_token: string; expires_in: number; expires_at: string }>(
        `/api/auth/${mode}`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("auth_storage_version", AUTH_STORAGE_VERSION);
      onToken(result.access_token);
      setIsSuccess(true);
      setMessage("Session Encrypted. Welcome back.");
    } catch (error) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message : "Handshake failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (token) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 backdrop-blur-xl">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <ShieldCheck size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Secure Node</span>
          <span className="text-[11px] font-bold text-slate-300">Authenticated</span>
        </div>
        <button
          className="ml-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("auth_storage_version");
            onToken(null);
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card neural-border relative grid w-full min-w-[340px] max-w-[420px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-white/5">
        <div className="auth-scan-line h-full w-1/2 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      </div>

      <div className="grid gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500">
              <BrainCircuit size={16} /> Neural Handshake
            </div>
            <h2 className="mt-2 text-xl font-black text-white">
              {mode === "signup" ? "Initialize Node" : "Access Protocol"}
            </h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
            RSA-4096
          </div>
        </div>

        <div className="flex rounded-xl border border-white/5 bg-slate-950 p-1">
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${mode === "signup" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20" : "text-slate-500 hover:text-white"}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            <UserPlus size={16} /> Sign up
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${mode === "login" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20" : "text-slate-500 hover:text-white"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            <LogIn size={16} /> Sign in
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity (Email)</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
              <Mail size={16} className="text-slate-600" />
              <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700" placeholder="user@neural.net" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </div>

          {mode === "signup" && (
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Handle (Username)</label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <User size={16} className="text-slate-600" />
                <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700" placeholder="node_identifier" value={username} onChange={(event) => setUsername(event.target.value)} />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Key (Password)</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
              <Lock size={16} className="text-slate-600" />
              <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="text-slate-600 hover:text-white" onClick={() => setShowPassword(!showPassword)} type="button">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {mode === "signup" && (
          <div className="grid gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-slate-500">Neural Strength Scan</span>
              <span className="text-cyan-400">{strengthLabel}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((item) => (
                <div
                  className={`h-1 rounded-full transition-colors ${item < strength ? "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "bg-white/5"}`}
                  key={item}
                />
              ))}
            </div>
          </div>
        )}

        <button
          className="flex items-center justify-center gap-3 rounded-xl bg-cyan-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-cyan-900/20 transition-all hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50"
          disabled={isSubmitting}
          onClick={submit}
          type="button"
        >
          {isSubmitting ? <BrainCircuit className="animate-spin" size={18} /> : <Fingerprint size={18} />}
          {isSubmitting ? "Syncing..." : mode === "signup" ? "Initialize Node" : "Access Cluster"}
        </button>

        <AnimatePresence>
          {message && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[11px] font-bold ${isSuccess ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-white/5 bg-white/5 text-slate-400"}`}
            >
              {isSuccess ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

