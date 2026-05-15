"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { api, Post, User } from "@/lib/api";

type Props = {
  token: string | null;
  user: User | null;
};

export function ModerationPanel({ token, user }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");

  if (!user || !["admin", "moderator"].includes(user.role)) {
    return null;
  }

  async function load() {
    if (!token) return;
    const queue = await api<Post[]>("/api/moderation/queue?status=review", {}, token);
    setPosts(queue);
    setMessage(`${queue.length} posts need review.`);
  }

  async function decide(postId: number, status: "approved" | "blocked") {
    if (!token) return;
    await api<Post>(
      `/api/moderation/posts/${postId}`,
      { method: "PATCH", body: JSON.stringify({ status, reason: status === "blocked" ? "Moderator blocked" : null }) },
      token
    );
    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  return (
    <div className="grid gap-3 rounded-md border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Moderation</h2>
        <button className="rounded-md border border-line p-2 hover:bg-paper" title="Load queue" onClick={load} type="button">
          <ShieldCheck size={18} />
        </button>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
      {posts.map((post) => (
        <div className="grid gap-2 rounded-md border border-line p-3" key={post.id}>
          <p className="text-sm font-semibold">{post.title}</p>
          <p className="text-xs text-slate-500">toxicity {Math.round(post.toxicity_score * 100)}%</p>
          <div className="flex gap-2">
            <button className="rounded-md bg-moss px-2 py-1 text-xs font-semibold text-white" onClick={() => decide(post.id, "approved")} type="button">Approve</button>
            <button className="rounded-md bg-ember px-2 py-1 text-xs font-semibold text-white" onClick={() => decide(post.id, "blocked")} type="button">Block</button>
          </div>
        </div>
      ))}
    </div>
  );
}
