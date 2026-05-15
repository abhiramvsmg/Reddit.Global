"use client";

import { BrainCircuit, FileText, ImagePlus, Link2, Loader2, Send, Sparkles, Tags, Wand2, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, AiAssist, Community, Post } from "@/lib/api";

type Props = {
  communities: Community[];
  token: string | null;
  onCreated: (post: Post) => void;
  initialCommunitySlug?: string;
};

export function PostComposer({ communities, token, onCreated, initialCommunitySlug }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [communitySlug, setCommunitySlug] = useState(initialCommunitySlug || "");
  const [message, setMessage] = useState("");
  const [assistResult, setAssistResult] = useState<AiAssist | null>(null);
  const [isAssisting, setIsAssisting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  async function createPost() {
    if (!token) {
      setMessage("Login to post.");
      return;
    }
    setIsPublishing(true);
    try {
      const post = await api<Post>(
        "/api/posts",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            content: content || null,
            link_url: linkUrl || null,
            image_url: imageUrl || null,
            community_slug: communitySlug || communities[0]?.slug,
          }),
        },
        token
      );
      setTitle("");
      setContent("");
      setLinkUrl("");
      setImageUrl("");
      setAssistResult(null);
      setMessage("");
      onCreated(post);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create post");
    } finally {
      setIsPublishing(false);
    }
  }

  async function assist() {
    if (!token) {
      setMessage("Login to use AI assist.");
      return;
    }
    setIsAssisting(true);
    try {
      const result = await api<AiAssist>(
        "/api/ai/post-assist",
        { method: "POST", body: JSON.stringify({ title, content }) },
        token
      );
      setAssistResult(result);
      setMessage(result.safety_note);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI assist failed");
    } finally {
      setIsAssisting(false);
    }
  }

  function applyAssist() {
    if (!assistResult) return;
    setTitle(assistResult.improved_title);
    setContent(assistResult.suggested_body || assistResult.summary);
    setMessage("AI suggestions applied.");
  }

  return (
    <div className="glass-card neural-border relative flex flex-col gap-4 rounded-2xl border border-white/10 p-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
            <BrainCircuit size={14} /> Neural Composer
          </div>
          <h2 className="text-lg font-bold text-white">Create New Post</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50"
          disabled={isAssisting || !title.trim()}
          onClick={assist}
        >
          {isAssisting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        </motion.button>
      </div>

      <div className="grid gap-3">
        <select 
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50" 
          value={communitySlug} 
          onChange={(e) => setCommunitySlug(e.target.value)}
        >
          <option value="" className="bg-slate-900">Choose Community</option>
          {communities.map((c) => (
            <option key={c.id} value={c.slug} className="bg-slate-900">r/{c.slug}</option>
          ))}
        </select>

        <input 
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50 placeholder:text-slate-600" 
          placeholder="An interesting title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />

        <textarea 
          className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-300 outline-none focus:border-cyan-500/50 placeholder:text-slate-600" 
          placeholder="Share your thoughts..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
        />
      </div>

      <AnimatePresence>
        {assistResult && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-1">AI Suggestion</p>
                  <p className="text-sm font-bold text-white">{assistResult.improved_title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{assistResult.summary}</p>
                </div>
                <button 
                  onClick={applyAssist}
                  className="shrink-0 flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white transition-transform hover:scale-105"
                >
                  <Wand2 size={12} /> Apply
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {assistResult.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-cyan-400/80 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">#{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Link2 className="absolute left-3 top-3 text-slate-500" size={14} />
          <input 
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500/50" 
            placeholder="Link URL" 
            value={linkUrl} 
            onChange={(e) => setLinkUrl(e.target.value)} 
          />
        </div>
        <div className="relative">
          <ImagePlus className="absolute left-3 top-3 text-slate-500" size={14} />
          <input 
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500/50" 
            placeholder="Image URL" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
          />
        </div>
      </div>

      <button 
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20 transition-all hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50"
        disabled={isPublishing || !title.trim()}
        onClick={createPost}
      >
        {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Publish to Community
      </button>

      {message && (
        <p className="text-center text-[11px] font-medium text-slate-500">{message}</p>
      )}
    </div>
  );
}

