"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { api, Community } from "@/lib/api";

type Props = {
  token: string | null;
  onCreated: (community: Community) => void;
};

export function CommunityForm({ token, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [message, setMessage] = useState("");

  async function createCommunity() {
    if (!token) {
      setMessage("Login to create a community.");
      return;
    }
    try {
      const community = await api<Community>(
        "/api/communities",
        { method: "POST", body: JSON.stringify({ name, description, banner_url: bannerUrl || null }) },
        token
      );
      setName("");
      setDescription("");
      setBannerUrl("");
      setMessage("");
      onCreated(community);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create community");
    }
  }

  return (
    <div className="grid gap-3 rounded-md border border-line bg-white p-4">
      <h2 className="text-base font-semibold">Create Community</h2>
      <input className="rounded-md border border-line px-3 py-2" placeholder="Community name" value={name} onChange={(event) => setName(event.target.value)} />
      <textarea className="min-h-20 rounded-md border border-line px-3 py-2" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
      <input className="rounded-md border border-line px-3 py-2" placeholder="Banner image URL" value={bannerUrl} onChange={(event) => setBannerUrl(event.target.value)} />
      <button className="flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 font-semibold text-white" onClick={createCommunity} type="button">
        <Plus size={16} /> Create
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
