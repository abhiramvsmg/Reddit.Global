import { useQuery } from "@tanstack/react-query";
import { api, Page, Post } from "../api";
import { useAuthStore } from "../store/useAuthStore";

export function usePosts(options: {
  selectedCommunity: string;
  sort: "date" | "votes";
  query: string;
  page: number;
}) {
  const { selectedCommunity, sort, query, page } = options;
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["posts", selectedCommunity, sort, query, page, !!token],
    queryFn: async () => {
      const search = !selectedCommunity && query ? `&q=${encodeURIComponent(query)}` : "";
      const path = selectedCommunity
        ? `/api/communities/${selectedCommunity}/posts?sort=${sort}&page=${page}&page_size=10`
        : `/api/posts?sort=${sort}&page=${page}&page_size=10${search}`;
      
      return api<Page<Post>>(path, {}, token);
    },
    placeholderData: (previousData) => previousData,
  });
}

