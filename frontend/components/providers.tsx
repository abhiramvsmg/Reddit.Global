"use client";

import { useWebSockets } from "@/hooks/useWebSockets";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useEffect } from "react";

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSockets();
  return <>{children}</>;
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </QueryClientProvider>

  );
}
