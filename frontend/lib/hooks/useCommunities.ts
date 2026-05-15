import { useQuery } from "@tanstack/react-query";
import { api, Community } from "../api";

export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: () => api<Community[]>("/api/communities"),
  });
}
