"use client";

import { BadgeCheck, Brain, MessageCircle, ShieldAlert, ThumbsDown, ThumbsUp, Sparkles, Share2, Bookmark as BookmarkIcon, Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Comment, Post } from "@/lib/api";

type Props = {
  post: Post;
  token: string | null;
  isDetailView?: boolean;
};

export function PostCard({ post, token, isDetailView = false }: Props) {
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(isDetailView);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isDetailView) {
      loadComments();
    }
  }, [isDetailView]);

  const voteMutation = useMutation({
    mutationFn: async (value: number) => {
      const newValue = post.user_vote === value ? 0 : value;
      return await api<{ vote_count: number; user_vote: number }>(
        "/api/votes",
        { method: "POST", body: JSON.stringify({ post_id: post.id, value: newValue }) },
        token
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p: any) => 
            p.id === post.id ? { ...p, vote_count: data.vote_count, user_vote: data.user_vote } : p
          )
        };
      });
      // Also update single post cache if exists
      queryClient.setQueryData(["post", post.id.toString()], (old: any) => {
        if (!old) return old;
        return { ...old, vote_count: data.vote_count, user_vote: data.user_vote };
      });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Vote failed");
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return await api<{ bookmarked: boolean }>(
        `/api/posts/${post.id}/bookmark`,
        { method: "POST" },
        token
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p: any) => 
            p.id === post.id ? { ...p, user_bookmarked: data.bookmarked } : p
          )
        };
      });
      queryClient.setQueryData(["post", post.id.toString()], (old: any) => {
        if (!old) return old;
        return { ...old, user_bookmarked: data.bookmarked };
      });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Bookmark failed");
    }
  });

  async function loadComments() {
    try {
      const result = await api<Comment[]>(`/api/posts/${post.id}/comments`);
      setComments(result);
      if (!isDetailView) setIsOpen(!isOpen);
    } catch (error) {
      setMessage("Could not load comments.");
    }
  }

  async function addComment(parentId: number | null = null) {
    if (!token) {
      setMessage("Login to comment.");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const result = await api<Comment>(
        "/api/comments",
        { method: "POST", body: JSON.stringify({ post_id: post.id, content: commentText, parent_id: parentId }) },
        token
      );
      
      if (parentId) {
        const updateReplies = (list: Comment[]): Comment[] => {
          return list.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies ?? []), result] };
            }
            if (c.replies) {
              return { ...c, replies: updateReplies(c.replies) };
            }
            return c;
          });
        };
        setComments(current => updateReplies(current));
      } else {
        setComments(current => [...current, result]);
      }
      
      setCommentText("");
      setReplyTo(null);
      setMessage("");
    } catch (error) {
      setMessage("Failed to post comment.");
    }
  }

  function renderComment(comment: Comment, depth = 0) {
    return (
      <div className="group relative mt-6 first:mt-0" key={comment.id} style={{ marginLeft: depth ? 20 : 0 }}>
        <div className="relative">
          {depth > 0 && (
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-white/5" />
          )}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all hover:bg-white/[0.03] hover:border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-surface to-background border border-white/5 flex items-center justify-center text-xs font-bold text-text-muted">
                {comment.author_username?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{comment.author_username ?? "user"}</p>
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-tighter">{new Date(comment.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-text-muted">{comment.content}</p>
            <div className="mt-4 flex items-center gap-4">
              <button 
                className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors" 
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                type="button"
              >
                Reply
              </button>
            </div>
            {replyTo === comment.id && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex gap-2"
              >
                <input 
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-background px-4 py-2.5 text-xs text-white outline-none focus:border-primary/50" 
                  placeholder="Neural transmission..." 
                  autoFocus
                  value={commentText} 
                  onChange={(event) => setCommentText(event.target.value)} 
                />
                <button 
                  className="rounded-xl bg-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-primary/20" 
                  onClick={() => addComment(comment.id)} 
                  type="button"
                >
                  Send
                </button>
              </motion.div>
            )}
          </div>
        </div>
        <div className="border-l border-white/5">
          {(comment.replies ?? []).map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card group relative grid grid-cols-[56px_1fr] overflow-hidden rounded-3xl border border-white/10"
    >
      <div className="flex flex-col items-center gap-3 border-r border-white/5 bg-white/[0.01] py-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`rounded-xl p-2 transition-all ${post.user_vote === 1 ? "bg-primary text-white shadow-lg shadow-primary/40" : "text-text-muted hover:bg-primary/10 hover:text-primary"}`} 
          onClick={() => { if(!token) setMessage("Login to vote"); else voteMutation.mutate(1); }} 
          type="button"
        >
          <ThumbsUp size={20} />
        </motion.button>
        <motion.span 
          key={post.vote_count}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-sm font-black transition-colors ${post.user_vote === 1 ? "text-primary" : post.user_vote === -1 ? "text-rose-400" : "text-white"}`}
        >
          {post.vote_count}
        </motion.span>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`rounded-xl p-2 transition-all ${post.user_vote === -1 ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40" : "text-text-muted hover:bg-rose-500/10 hover:text-rose-400"}`} 
          onClick={() => { if(!token) setMessage("Login to vote"); else voteMutation.mutate(-1); }} 
          type="button"
        >
          <ThumbsDown size={20} />
        </motion.button>
      </div>

      <div className="grid gap-4 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
            <Link className="text-primary-hover hover:underline" href={`/r/${post.community_slug ?? ""}`}>r/{post.community_slug ?? "community"}</Link>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span className="text-text-muted">Broadcast by <Link className="text-white hover:text-primary" href={`/u/${post.author_username ?? ""}`}>{post.author_username ?? "user"}</Link></span>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span className="text-text-muted">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
             <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${post.moderation_status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
              {post.moderation_status === "approved" ? <BadgeCheck size={12} /> : <ShieldAlert size={12} />}
              {post.moderation_status}
            </span>
          </div>
        </div>

        <Link className="text-2xl font-black leading-tight text-white transition-colors hover:text-primary lg:text-3xl" href={`/posts/${post.id}`}>{post.title}</Link>

        {post.ai_summary && (
          <div className="neural-border relative rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 text-sm leading-relaxed text-text-muted">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-hover">
              <Sparkles size={14} /> Neural Synthesis
            </div>
            <p className="italic">{post.ai_summary}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-text-muted">
            <Brain size={12} className="text-primary" /> {post.language}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-text-muted">
             Toxicity: {Math.round(post.toxicity_score * 100)}%
          </span>
          {(post.ai_tags ?? "").split(",").filter(Boolean).map((tag) => (
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/80" key={tag}>#{tag}</span>
          ))}
        </div>

        {post.content && <p className={`${isDetailView ? "" : "line-clamp-4"} text-base leading-relaxed text-text-muted`}>{post.content}</p>}
        
        {post.image_url && (
          <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <img className="max-h-[600px] w-full object-cover transition-transform duration-1000 group-hover:scale-105" src={post.image_url} alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {!isDetailView && (
              <button 
                className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-muted transition-all hover:bg-white/10 hover:text-white border border-white/5" 
                onClick={loadComments} 
                type="button"
              >
                <MessageCircle size={18} /> {post.comment_count} Transmissions
              </button>
            )}
            <button 
              onClick={() => { if(!token) setMessage("Login to bookmark"); else bookmarkMutation.mutate(); }}
              className={`flex items-center gap-2.5 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border ${post.user_bookmarked ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border-white/5"}`} 
              type="button"
            >
              <BookmarkIcon size={18} fill={post.user_bookmarked ? "currentColor" : "none"} /> 
              {post.user_bookmarked ? "Stored" : "Store Packet"}
            </button>
            <button className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-muted transition-all hover:bg-white/10 hover:text-white border border-white/5" type="button">
              <Share2 size={18} /> Relink
            </button>
          </div>
          {message && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
            >
              {message}
            </motion.span>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-8 grid gap-8 border-t border-white/5 pt-8">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity size={24} className="text-primary" />
                  </div>
                  <input 
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-background/50 px-6 py-4 text-sm text-white outline-none focus:border-primary/50 transition-all" 
                    placeholder="Contribute to the neural fabric..." 
                    value={commentText} 
                    onChange={(event) => setCommentText(event.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                  />
                  <button 
                    className="rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-primary-hover disabled:opacity-50" 
                    onClick={() => addComment()} 
                    disabled={!commentText.trim()}
                    type="button"
                  >
                    Post
                  </button>
                </div>
                <div className="grid gap-8">
                  {comments.map((comment) => renderComment(comment))}
                  {!comments.length && (
                    <div className="py-12 text-center">
                      <MessageCircle size={32} className="mx-auto mb-4 text-white/5" />
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
                        Sector is currently silent
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}


