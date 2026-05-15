import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";

type WSEvent = {
  event: "notification" | "vote_update" | "presence";
  data: any;
};

export const useWebSockets = () => {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const wsBaseUrl = API_URL.replace(/^http/, "ws").replace(/\/$/, "");
    const wsUrl = `${wsBaseUrl}/ws/${user.id}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload: WSEvent = JSON.parse(event.data);
        console.log("WebSocket message:", payload);

        switch (payload.event) {
          case "notification":
            // Handle notification (e.g., show a toast, update notification count)
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            break;
          case "vote_update":
            // Handle vote update
            const { post_id, vote_count } = payload.data;
            queryClient.setQueryData(["posts"], (old: any) => {
              if (!old) return old;
              return {
                ...old,
                items: old.items.map((post: any) => 
                  post.id === post_id ? { ...post, vote_count } : post
                )
              };
            });
            break;
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [token, user, queryClient]);

  return { isConnected };
};
