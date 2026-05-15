import axios, { AxiosError } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const AUTH_STORAGE_VERSION = "2026-05-auth-v2";

// ... (types remain the same)
export type Community = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  banner_url?: string | null;
  ai_topic?: string | null;
  member_count: number;
};

export type User = {
  id: number;
  email: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: string;
};

export type Post = {
  id: number;
  title: string;
  content?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  community_slug?: string | null;
  author_username?: string | null;
  vote_count: number;
  comment_count: number;
  created_at: string;
  ai_summary?: string | null;
  ai_tags?: string | null;
  moderation_status: string;
  moderation_reason?: string | null;
  toxicity_score: number;
  language: string;
  user_vote: number;
  user_bookmarked: boolean;
};


export type AiAssist = {
  improved_title: string;
  summary: string;
  suggested_body?: string | null;
  tags: string[];
  language: string;
  toxicity_score: number;
  moderation_status: string;
  safety_note: string;
  tone: string;
  provider: string;
};

export type AiStatus = {
  provider: string;
  model: string;
  connected: boolean;
  mode: string;
};

export type Comment = {
  id: number;
  content: string;
  author_username?: string | null;
  created_at: string;
  parent_id?: number | null;
  replies?: Comment[];
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  if (typeof window === "undefined") return null;
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isUsableToken(token: string | null): token is string {
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now() + 5000;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers: Record<string, string> = {};
  
  if (options.headers) {
    const h = new Headers(options.headers);
    h.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await httpClient.request({
      url: path,
      method,
      data: options.body,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      const message = status === 401
        ? "Your session expired. Please log in again."
        : data?.detail || error.message || "Request failed";
      throw new ApiError(message, status);
    }
    throw error;
  }
}

