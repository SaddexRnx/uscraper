export type ScrapeResponse = {
  url: string;
  status: number;
  cached: boolean;
  method_used: string;
  data: Record<string, string[]>;
};

export type HistoryItem = {
  url: string;
  selectors: string[];
  timestamp: number;
};

export const DEFAULT_API_URL = "http://44.223.33.99:8000";
export const API_URL_STORAGE_KEY = "ultra-scraper:api-url";
export const HISTORY_STORAGE_KEY = "ultra-scraper:history";
export const MAX_HISTORY = 5;
