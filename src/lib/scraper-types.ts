export type ScrapeResponse = {
  url: string;
  status: number;
  cached: boolean;
  method_used: string;
  data: Record<string, string[]>;
};

export type HistoryItem = {
  id: string;
  url: string;
  selectors: string[];
  status: "success" | "failed";
  method_used: string;
  timestamp: number;
};

export type ProxyProvider = "free" | "scraperapi" | "zenrows" | "scrapingbee";

export type ProxySettings = {
  provider: ProxyProvider;
  apiKey: string;
};

export type AdminToken = {
  token: string;
  quotaLimit: number;
  quotaUsed: number;
  createdAt: number;
};

export const DEFAULT_API_URL = "https://uscraper.duckdns.org";
export const API_URL_STORAGE_KEY = "ultra-scraper:api-url";
export const HISTORY_STORAGE_KEY = "ultra-scraper:history";
export const PROXY_STORAGE_KEY = "ultra-scraper:proxy";
export const TOKEN_STORAGE_KEY = "ultra-scraper:token";
export const USER_STORAGE_KEY = "ultra-scraper:user";
export const QUOTA_STORAGE_KEY = "ultra-scraper:quota";
export const ADMIN_TOKENS_STORAGE_KEY = "ultra-scraper:admin-tokens";
export const MAX_HISTORY = 50;

export const ADMIN_TOKEN_PREFIX = "ADMIN-";
