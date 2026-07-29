import {
  API_URL_STORAGE_KEY,
  DEFAULT_API_URL,
  PROXY_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  type ProxySettings,
} from "./scraper-types";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getApiUrl(): string {
  return readStorage(API_URL_STORAGE_KEY) || DEFAULT_API_URL;
}

export function getToken(): string | null {
  return readStorage(TOKEN_STORAGE_KEY);
}

export function getProxySettings(): ProxySettings {
  const raw = readStorage(PROXY_STORAGE_KEY);
  if (!raw) return { provider: "free", apiKey: "" };
  try {
    return JSON.parse(raw) as ProxySettings;
  } catch {
    return { provider: "free", apiKey: "" };
  }
}

export type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const base = getApiUrl().replace(/\/$/, "");
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  const signal = opts.signal ?? controller.signal;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers ?? {}),
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${base}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal,
    });
    const text = await res.text();
    const json = text ? safeParse(text) : null;
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      if (json && typeof json === "object" && "message" in json) {
        const m = (json as Record<string, unknown>).message;
        if (typeof m === "string" && m) msg = m;
      }
      throw new ApiError(msg, res.status);
    }
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
