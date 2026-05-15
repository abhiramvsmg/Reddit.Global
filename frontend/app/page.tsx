"use client";

import { Activity, Bot, Cpu, RadioTower, RefreshCw, Search, ShieldCheck, Sparkles, Users, Zap, LayoutGrid, TrendingUp, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthScreen } from "@/components/auth-screen";
import { CommunityForm } from "@/components/community-form";

import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { ProfilePanel } from "@/components/profile-panel";
import { ModerationPanel } from "@/components/moderation-panel";
import { AiAssistant } from "@/components/ai-assistant";
import { api, AiStatus, ApiError, AUTH_STORAGE_VERSION, Community, isUsableToken, Page, Post, User } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { usePosts } from "@/lib/hooks/usePosts";
import { useCommunities } from "@/lib/hooks/useCommunities";

export default function Home() {
  const { token, setToken, user, setUser } = useAuthStore();
  const [sort, setSort] = useState<"date" | "votes">("date");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const { data: communitiesData } = useCommunities();
  const communities = communitiesData ?? [];

  const { 
    data: postsData, 
    isLoading: isLoadingPosts,
    isPlaceholderData 
  } = usePosts({ selectedCommunity, sort, query, page });
  
  const posts = postsData?.items ?? [];
  const total = postsData?.total ?? 0;
  const hasNext = postsData?.has_next ?? false;

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: () => api<AiStatus>("/api/ai/status", {}, token),
    enabled: !!token,
  });

  const aiInsights = useMemo(() => {
    const reviewCount = posts.filter((post) => post.moderation_status !== "approved").length;
    const elevatedRiskCount = posts.filter((post) => post.toxicity_score >= 0.45).length;
    const tagCounts = posts
      .flatMap((post) => (post.ai_tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean))
      .reduce<Record<string, number>>((counts, tag) => {
        counts[tag] = (counts[tag] ?? 0) + 1;
        return counts;
      }, {});
    const topTags = Object.entries(tagCounts)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 4)
      .map(([tag]) => tag);
    const languages = Array.from(new Set(posts.map((post) => post.language).filter(Boolean))).slice(0, 3);
    const summarizedCount = posts.filter((post) => post.ai_summary).length;

    return { elevatedRiskCount, languages, reviewCount, summarizedCount, topTags };
  }, [posts]);

  // Initial load of user profile if token exists but user doesn't
  useEffect(() => {
    if (token && !user) {
      api<User>("/api/auth/me", {}, token)
        .then(setUser)
        .catch((error) => {
          if (error instanceof ApiError && error.status === 401) {
            setToken(null);
          }
        });
    }
  }, [token, user, setToken, setUser]);

  const queryClient = useQueryClient();

  if (!token) {
    return <AuthScreen message={message} onToken={setToken} />;
  }


  return (
    <main className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Neural Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
        <section className="relative mt-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Neural Hub Hero */}
              <div className="glass-card neural-border relative flex flex-col justify-center rounded-3xl p-8">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary-hover">
                    <Sparkles size={14} /> Intelligence Hub Active
                  </div>
                  <h2 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                    Analyze. Create. <br />
                    <span className="text-primary">Augment.</span>
                  </h2>
                  <p className="mt-4 max-w-xl text-lg text-text-muted">
                    Welcome to the next generation of social engagement. Your feed is powered by real-time neural signals and safety protocols.
                  </p>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="glass-card rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-hover"><Bot size={14} /> Insights</div>
                    <div className="mt-2 text-3xl font-black text-white">{aiInsights.summarizedCount}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Neural Summaries Applied</div>
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400"><ShieldCheck size={14} /> Safety</div>
                    <div className="mt-2 text-3xl font-black text-white">{total - aiInsights.reviewCount}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Verified Content Stream</div>
                  </div>
                  <div className="glass-card rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400"><TrendingUp size={14} /> Signals</div>
                    <div className="mt-2 text-3xl font-black text-white">{aiInsights.elevatedRiskCount}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Anomalies Detected</div>
                  </div>
                </div>
              </div>

              {/* Side Status */}
              <div className="grid gap-4">
                <div className="glass-card rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted"><Activity size={14} /> System Load</div>
                    <div className="mt-2 text-4xl font-black text-white">{total}</div>
                    <p className="text-xs text-text-muted">Real-time data packets indexed</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Neural Status</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* Navigation Sidebar */}
        <aside className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Clusters</h2>
              <LayoutGrid size={16} className="text-primary" />
            </div>
            <div className="space-y-2">
              <button
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${selectedCommunity === "" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:bg-white/5 hover:text-white"}`}
                onClick={() => setSelectedCommunity("")}
              >
                Global Stream
              </button>
              {communities.map((community) => (
                <button
                  className={`w-full rounded-xl px-4 py-3 text-left transition-all ${selectedCommunity === community.slug ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:bg-white/5 hover:text-white"}`}
                  key={community.id}
                  onClick={() => setSelectedCommunity(community.slug)}
                >
                  <div className="text-sm font-bold">r/{community.slug}</div>
                  {community.description && <div className="text-[10px] opacity-60 line-clamp-1">{community.description}</div>}
                </button>
              ))}
            </div>
          </div>
          <CommunityForm token={token} onCreated={() => queryClient.invalidateQueries({ queryKey: ["communities"] })} />
        </aside>

        {/* Main Feed */}
        <section className="space-y-6">
          <div className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/5 p-4">
            <div className="flex rounded-xl border border-white/5 bg-surface p-1">
              <button className={`rounded-lg px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${sort === "date" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-white"}`} onClick={() => setSort("date")}>
                Linear
              </button>
              <button className={`rounded-lg px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${sort === "votes" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-white"}`} onClick={() => setSort("votes")}>
                Popular
              </button>
            </div>
            <div className="flex min-w-0 flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-3 text-text-muted" />
                <input className="w-full rounded-xl border border-white/5 bg-surface py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:border-primary/50" placeholder="Scan neural tags..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-surface text-text-muted hover:text-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}>
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {isLoadingPosts && !isPlaceholderData ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card h-48 rounded-3xl skeleton" />
                ))
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} token={token} />
                ))
              )}
            </AnimatePresence>
            {!isLoadingPosts && !posts.length && <div className="glass-card rounded-3xl p-10 text-center text-text-muted">No signals detected in this cluster.</div>}
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-white/5 bg-surface p-4">
            <button className="rounded-xl border border-white/10 px-6 py-2 text-xs font-black uppercase tracking-widest text-text-muted disabled:opacity-20 hover:text-white" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Signal Block {page}</span>
            <button className="rounded-xl border border-white/10 px-6 py-2 text-xs font-black uppercase tracking-widest text-text-muted disabled:opacity-20 hover:text-white" disabled={!hasNext} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </section>

        {/* Action Sidebar */}
        <aside className="space-y-6">
          <PostComposer communities={communities} token={token} onCreated={() => queryClient.invalidateQueries({ queryKey: ["posts"] })} />
          <ProfilePanel token={token} user={user} onUser={setUser} />
          <ModerationPanel token={token} user={user} />
          
          <div className="glass-card rounded-3xl border border-white/5 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-hover">
                <Cpu size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Interface Protocol</h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary-hover">Neural Assist</p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">AI analyzes and augments all content before synchronization with the social fabric.</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5">
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-400">Moderation v4.0</p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">Real-time toxicity and risk detection active across all clusters.</p>
              </div>
              <div className="pt-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Engine: {aiStatus?.provider ?? "Fallback"} • Model: {aiStatus?.model ?? "Fallback"}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AiAssistant />
    </main>
  );
}
