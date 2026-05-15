"use client";

import { BrainCircuit, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { api, Post } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { motion } from "framer-motion";


export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, setToken } = useAuthStore();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", params.id],
    queryFn: async () => {
      return await api<Post>(`/api/posts/${params.id}`, {}, token);
    },
  });

  return (
    <main className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Neural Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto mt-10 max-w-3xl px-4 relative z-10">
        <Link 
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors" 
          href="/"
        >
          <ChevronLeft size={16} /> Back to neural stream
        </Link>
        
        {error && (
          <div className="glass-card rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm font-bold text-rose-400">
            Signal Lost: {error instanceof Error ? error.message : "Packet corrupted"}
          </div>
        )}
        
        {post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PostCard post={post} token={token} isDetailView={true} />
          </motion.div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
              <BrainCircuit className="text-primary" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary/50">Decoding Signal...</div>
          </div>
        )}
      </div>
    </main>
  );
}

