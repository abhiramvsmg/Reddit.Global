"use client";

import { Bell, CheckCircle2, MessageSquare, Info, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";


export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return await api<any[]>("/api/users/me/notifications", {}, token);
    },
    enabled: !!token,
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api(`/api/notifications/${id}/read`, { method: "PATCH" }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });


  const getIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare size={16} className="text-primary" />;
      case "vote": return <Star size={16} className="text-amber-400" />;
      default: return <Info size={16} className="text-accent" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-white/5 bg-background/90 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="border-b border-white/5 p-4 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Signals</h3>
                <button className="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-widest">
                  Clear All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-xs italic">
                    No neural signals detected.
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => markReadMutation.mutate(n.id)}
                      className={`w-full p-4 flex gap-3 text-left transition-all hover:bg-white/5 border-b border-white/[0.02] ${!n.is_read ? "bg-primary/5" : ""}`}
                    >
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold text-white truncate">{n.title}</p>
                          <span className="text-[8px] text-text-muted uppercase font-black tracking-tighter whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-text-muted line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
