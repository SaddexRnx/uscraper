import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Play, Settings, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";

import { SettingsDialog } from "@/components/scraper/SettingsDialog";
import { SelectorInput } from "@/components/scraper/SelectorInput";
import { LoadingStatus } from "@/components/scraper/LoadingStatus";
import { ResultsView } from "@/components/scraper/ResultsView";
import { HistoryPanel } from "@/components/scraper/HistoryPanel";
import {
  API_URL_STORAGE_KEY,
  DEFAULT_API_URL,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
  type HistoryItem,
  type ScrapeResponse,
} from "@/lib/scraper-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ultra Scraper — Professional Web Scraping Dashboard" },
      {
        name: "description",
        content:
          "Ultra Scraper is a professional web scraping dashboard for extracting data from any URL using CSS selectors with anti-bot bypass and instant export.",
      },
      { property: "og:title", content: "Ultra Scraper — Professional Web Scraping Dashboard" },
      {
        property: "og:description",
        content:
          "Extract structured data from any website using CSS selectors, with anti-bot bypass, caching, and one-click JSON/CSV export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT_SELECTORS = ["h1", ".a-size-medium.a-color-base.a-text-normal"];

function isValidUrl(u: string): boolean {
  if (!/^https?:\/\//i.test(u)) return false;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function Index() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState<string[]>(DEFAULT_SELECTORS);
  const [urlTouched, setUrlTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResponse | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load persisted state
  useEffect(() => {
    try {
      const savedApi = localStorage.getItem(API_URL_STORAGE_KEY);
      if (savedApi) setApiUrl(savedApi);
      const savedHist = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch {
      /* ignore */
    }
  }, []);

  const urlValid = url === "" || isValidUrl(url);
  const canSubmit = isValidUrl(url) && selectors.length > 0 && !loading;

  const saveApiUrl = (u: string) => {
    setApiUrl(u);
    try {
      localStorage.setItem(API_URL_STORAGE_KEY, u);
    } catch {
      /* ignore */
    }
  };

  const saveHistory = (next: HistoryItem[]) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const pushHistory = (item: HistoryItem) => {
    const filtered = history.filter(
      (h) => !(h.url === item.url && JSON.stringify(h.selectors) === JSON.stringify(item.selectors)),
    );
    saveHistory([item, ...filtered].slice(0, MAX_HISTORY));
  };

  const runScrape = async () => {
    setUrlTouched(true);
    if (!isValidUrl(url) || selectors.length === 0) return;
    setError(null);
    setResult(null);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const base = apiUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ url, selectors }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ScrapeResponse;
      if (!json || typeof json !== "object" || !json.data) {
        throw new Error("Malformed response");
      }
      setResult(json);
      pushHistory({ url, selectors: [...selectors], timestamp: Date.now() });
    } catch {
      setError(
        "Scraping failed. The target site's anti-bot system was too aggressive, or the request timed out. Please try again or check your Backend API URL in Settings.",
      );
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const runHistoryItem = (item: HistoryItem) => {
    setUrl(item.url);
    setSelectors(item.selectors);
    setUrlTouched(true);
    // Give state a tick to settle, then submit
    setTimeout(() => {
      void runScrapeWith(item.url, item.selectors);
    }, 0);
  };

  const runScrapeWith = async (u: string, sels: string[]) => {
    if (!isValidUrl(u) || sels.length === 0) return;
    setError(null);
    setResult(null);
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const base = apiUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ url: u, selectors: sels }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ScrapeResponse;
      if (!json || typeof json !== "object" || !json.data) throw new Error("Malformed");
      setResult(json);
      pushHistory({ url: u, selectors: [...sels], timestamp: Date.now() });
    } catch {
      setError(
        "Scraping failed. The target site's anti-bot system was too aggressive, or the request timed out. Please try again or check your Backend API URL in Settings.",
      );
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const apiHost = useMemo(() => {
    try {
      return new URL(apiUrl).host;
    } catch {
      return apiUrl;
    }
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
              <Zap className="h-4 w-4 text-foreground" />
            </div>
            <h1 className="text-base font-semibold tracking-tight">Ultra Scraper</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono">{apiHost}</span>
            </span>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6 min-w-0">
            {/* Input card */}
            <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">New scrape</h2>
                <p className="text-sm text-muted-foreground">
                  Extract text content from any public URL using one or more CSS selectors.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="target-url">Target URL</Label>
                  <Input
                    id="target-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={() => setUrlTouched(true)}
                    placeholder="https://www.amazon.com/s?k=mechanical+keyboard"
                    spellCheck={false}
                    autoComplete="off"
                    className="h-11 font-mono text-sm"
                    aria-invalid={!urlValid}
                  />
                  {urlTouched && !urlValid && (
                    <p className="text-xs text-destructive">
                      URL must start with http:// or https://
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>CSS Selectors</Label>
                    <span className="text-xs text-muted-foreground">
                      {selectors.length} added
                    </span>
                  </div>
                  <SelectorInput selectors={selectors} onChange={setSelectors} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Sends <code className="font-mono">POST /scrape</code> to your configured backend.
                  </p>
                  <Button
                    onClick={runScrape}
                    disabled={!canSubmit}
                    size="lg"
                    className="h-11 min-w-[160px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Scrape Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* Error alert */}
            {error && !loading && (
              <Alert variant="destructive" className="border-destructive/60">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Scrape failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading */}
            {loading && <LoadingStatus />}

            {/* Results */}
            {result && !loading && <ResultsView result={result} />}

            {!result && !loading && !error && (
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                  <Play className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-medium">No results yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter a target URL and at least one CSS selector, then click Scrape Data.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <HistoryPanel
              items={history}
              onSelect={runHistoryItem}
              onClear={() => saveHistory([])}
            />
          </aside>
        </div>
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiUrl={apiUrl}
        onSave={saveApiUrl}
      />
    </div>
  );
}
