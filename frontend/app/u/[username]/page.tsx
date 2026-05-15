"use client";

import { ChevronLeft, Fingerprint, ShieldCheck, User as UserIcon, Activity, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { api, Page, Post, User } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { motion } from "framer-motion";


export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const { token, setToken } = useAuthStore();

  const { data: user, isLoading: isLoadingUser, error } = useQuery({
    queryKey: ["user", params.username],
    queryFn: async () => {
      return await api<User>(`/api/users/${params.username}`, {}, token);
    },
  });

  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["user-posts", params.username],
    queryFn: async () => {
      return await api<Page<Post>>(`/api/users/${params.username}/posts?page=1&page_size=20`, {}, token);
    },
  });
  const posts = postsData?.items || [];

  return (
    <main className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Neural Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>


      <div className="mx-auto mt-10 max-w-4xl px-4 relative z-10">
        <Link 
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors" 
          href="/"
        >
          <ChevronLeft size={16} /> Back to neural stream
        </Link>
        
        {error && (
          <div className="glass-card rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm font-bold text-rose-400">
            Node Not Found: {error instanceof Error ? error.message : "Packet corrupted"}
          </div>
        )}
        
        {isLoadingUser ? (
          <div className="glass-card h-64 rounded-3xl skeleton" />
        ) : user && (
          <div className="space-y-10">
            <section className="glass-card neural-border relative rounded-3xl p-8 lg:p-10">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-10">
                <div className="relative">
                  <div className="neural-glow h-40 w-40 overflow-hidden rounded-3xl border-2 border-white/10 bg-surface shadow-2xl">
                    {user.avatar_url ? (
                      <img className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={user.avatar_url} alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-700">
                        <UserIcon size={80} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/40">
                    <Fingerprint size={24} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <h1 className="text-5xl font-black tracking-tighter text-white lg:text-6xl">@{user.username}</h1>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary-hover">
                      <ShieldCheck size={14} /> {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <span className="flex items-center gap-1"><Zap size={12} className="text-primary" /> Node ID: {user.id.toString().padStart(6, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1"><Activity size={12} className="text-emerald-400" /> Pulse: Active</span>
                  </div>
                  <p className="mt-4 text-xl text-text-muted leading-relaxed max-w-2xl">
                    {user.bio || "No biographical data synchronized for this node yet."}
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-6 border-t border-white/5 pt-10 sm:grid-cols-3">
                <div className="glass-card rounded-2xl bg-white/[0.02] border border-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Transmissions</p>
                  <p className="mt-2 text-2xl font-black text-white">{posts.length}</p>
                </div>
                <div className="glass-card rounded-2xl bg-white/[0.02] border border-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Neural Impact</p>
                  <p className="mt-2 text-2xl font-black text-white">Verified</p>
                </div>
                <div className="glass-card rounded-2xl bg-white/[0.02] border border-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Signal Status</p>
                  <p className="mt-2 text-2xl font-black text-emerald-400">Stable</p>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">Neural Transmissions</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="grid gap-6">
                {isLoadingPosts ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="glass-card h-48 rounded-3xl skeleton" />
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} token={token} />
                  ))
                ) : (
                  <div className="glass-card rounded-3xl p-20 text-center">
                    <Sparkles size={40} className="mx-auto mb-4 text-primary/20" />
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                      No broadcast signals found.
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

