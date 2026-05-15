"use client";

import { BrainCircuit, ChevronLeft, LayoutGrid, Users, Activity, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { api, Community, Page, Post } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { usePosts } from "@/lib/hooks/usePosts";
import { useCommunities } from "@/lib/hooks/useCommunities";
import { motion } from "framer-motion";


export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const { token, setToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ["community", params.slug],
    queryFn: async () => {
      return await api<Community>(`/api/communities/${params.slug}`, {}, token);
    },
  });

  const { data: communitiesData } = useCommunities();
  const communities = communitiesData || [];

  const { data: postsData, isLoading: isLoadingPosts } = usePosts({
    selectedCommunity: params.slug,
    sort: "date",
    query: "",
    page: 1,
  });
  const posts = postsData?.items || [];

  return (
    <main className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Neural Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>


      {community?.banner_url && (
        <div className="relative h-64 w-full overflow-hidden border-b border-white/5">
          <img className="h-full w-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700" src={community.banner_url} alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      <div className="mx-auto mt-8 max-w-7xl px-4 relative z-10">
        <Link 
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors" 
          href="/"
        >
          <ChevronLeft size={16} /> Back to neural stream
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <section className="glass-card neural-border relative rounded-3xl p-8 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary-hover">
                    <Activity size={12} /> Cluster Active
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-white lg:text-6xl">r/{community?.slug ?? params.slug}</h1>
                  <p className="mt-4 max-w-2xl text-xl text-text-muted leading-relaxed">
                    {community?.description || "Synchronizing cluster protocols..."}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="neural-glow flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-2xl">
                    <LayoutGrid size={40} />
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex flex-wrap gap-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 border border-white/5 shadow-inner">
                  <Users size={18} className="text-primary" />
                  <div>
                    <div className="text-lg font-black text-white">{community?.member_count ?? 0}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Nodes Linked</div>
                  </div>
                </div>
                {community?.ai_topic && (
                  <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-5 py-3 border border-primary/20 shadow-lg shadow-primary/5">
                    <BrainCircuit size={18} className="text-primary-hover" />
                    <div>
                      <div className="text-lg font-black text-white">{community.ai_topic}</div>
                      <div className="text-[10px] font-bold text-primary-hover uppercase tracking-tighter">Neural Vector</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-5 py-3 border border-emerald-500/20">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <div>
                    <div className="text-lg font-black text-white">Secure</div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Protocol Status</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              {isLoadingPosts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card h-48 rounded-3xl skeleton" />
                ))
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} token={token} />
                ))
              )}
              {!posts.length && !isLoadingPosts && (
                <div className="glass-card rounded-3xl p-20 text-center">
                  <Sparkles size={48} className="mx-auto mb-4 text-primary/20" />
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">
                    Cluster is currently silent.
                  </div>
                  <p className="mt-2 text-xs text-text-muted/60">Be the first to transmit a signal to this cluster.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <PostComposer 
              communities={communities} 
              token={token} 
              initialCommunitySlug={params.slug}
              onCreated={() => queryClient.invalidateQueries({ queryKey: ["posts", params.slug] })} 
            />

            <div className="glass-card rounded-3xl border border-white/5 p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-hover">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Cluster Protocol</h2>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                This community is an autonomous cluster within the neural social fabric. All transmissions are subject to real-time AI moderation, sentiment analysis, and safety protocols.
              </p>
              <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Initialization</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {community ? new Date().toLocaleDateString() : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Signal Integrity</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">99.9% Verified</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

