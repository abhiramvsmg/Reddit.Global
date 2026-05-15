"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { api, User } from "@/lib/api";

type Props = {
  token: string | null;
  user: User | null;
  onUser: (user: User) => void;
};

export function ProfilePanel({ token, user, onUser }: Props) {
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBio(user?.bio ?? "");
    setAvatarUrl(user?.avatar_url ?? "");
  }, [user]);

  async function save() {
    if (!token) {
      setMessage("Login to edit your profile.");
      return;
    }
    const updated = await api<User>(
      "/api/users/me",
      { method: "PATCH", body: JSON.stringify({ bio, avatar_url: avatarUrl || null }) },
      token
    );
    onUser(updated);
    setMessage("Profile updated.");
  }

  return (
    <div className="grid gap-3 rounded-md border border-line bg-white p-4">
      <h2 className="text-base font-semibold">Profile</h2>
      {user && <p className="text-sm text-slate-600">@{user.username} - {user.role}</p>}
      <input className="rounded-md border border-line px-3 py-2" placeholder="Avatar URL" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
      <textarea className="min-h-20 rounded-md border border-line px-3 py-2" placeholder="Bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      <button className="flex items-center justify-center gap-2 rounded-md bg-moss px-3 py-2 font-semibold text-white" onClick={save} type="button">
        <Save size={16} /> Save
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
