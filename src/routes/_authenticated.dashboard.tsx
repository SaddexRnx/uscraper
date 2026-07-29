import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { SelectorInput } from "@/components/scraper/SelectorInput";
import { LoadingStatus } from "@/components/scraper/LoadingStatus";
import { ResultsView } from "@/components/scraper/ResultsView";
import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
  type HistoryItem,
  type ScrapeResponse,
} from "@/lib/scraper-types";
import { ApiError, apiRequest, getProxySettings } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ultra Scraper" },
      { name: "description", content: "Extract data from any URL using CSS selectors." },
      { property: "og:title", content: "Dashboard — Ultra Scraper" },
      { property: "og:description", content: "Extract data from any URL using CSS selectors." },
    ],
  }),
  component: DashboardPage,
});

const DEFAULT_SELECTORS = ["h1", ".product-title"];
const AI_SUGGESTIONS = ["h1", ".price", "img.src"];

function isValidUrl(u: string): boolean {
  if (!/^https?:\/\//i.test(u)) return false;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function pushHistory(item: HistoryItem) {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    const next = [item, ...list].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function DashboardPage() {
  const { incrementQuota, quota } = useAuth();
  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState<string[]>(DEFAULT_SELECTORS);
  const [urlTouched, setUrlTouched] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResponse | null>(null);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const t = setInterval(() => setLoadingStep((s) => (s + 1) % 3), 1500);
    return () => clearInterval(t);
  }, [loading]);

  const urlValid = url === "" || isValidUrl(url);
  const overQuota = quota.used >= quota.limit;
  const canSubmit = isValidUrl(url) && selectors.length > 0 && !loading && !overQuota;

  const runAi = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSelectors(AI_SUGGESTIONS);
    setAiLoading(false);
    toast.success("AI suggestions applied");
  };

  const runScrape = async () => {
    setUrlTouched(true);
    if (!canSubmit) return;
    setError(null);
    setResult(null);
    setLoading(true);

    const proxy = getProxySettings();

    try {
      const json = await apiRequest<ScrapeResponse>("/scrape", {
        method: "POST",
        body: { url, selectors, proxy_config: proxy },
      });
      if (!json || typeof json !== "object" || !json.data) {
        throw new Error("Malformed response");
      }
      setResult(json);
      incrementQuota();
      pushHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        selectors: [...selectors],
        status: "success",
        method_used: json.method_used,
        timestamp: Date.now(),
      });
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      const message =
        status === 403
          ? "Quota exceeded. Contact your admin for a new token."
          : "Scraping failed. The target site's anti-bot system was too aggressive, your quota is exceeded, or the request timed out.";
      setError(message);
      pushHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        selectors: [...selectors],
        status: "failed",
        method_used: "n/a",
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadingMessages = useMemo(
    () => ["Connecting...", "Bypassing anti-bot...", "Extracting data..."],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Extract text and attributes from any public URL using CSS selectors.
        </p>
      </div>

      {overQuota && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quota exceeded</AlertTitle>
          <AlertDescription>
            You've used all {quota.limit} scrapes on this token. Contact your admin for more.
          </AlertDescription>
        </Alert>
      )}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <Input
              id="target-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setUrlTouched(true)}
              placeholder="https://example.com/products"
              spellCheck={false}
              autoComplete="off"
              className="h-11 font-mono text-sm"
              aria-invalid={!urlValid}
            />
            {urlTouched && !urlValid && (
              <p className="text-xs text-destructive">URL must start with http:// or https://</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>CSS Selectors</Label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{selectors.length} added</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={runAi}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Auto-Detect (AI)
                </Button>
              </div>
            </div>
            <SelectorInput selectors={selectors} onChange={setSelectors} />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Sends <code className="font-mono">POST /scrape</code> with your token and proxy config.
            </p>
            <Button onClick={runScrape} disabled={!canSubmit} size="lg" className="h-11 min-w-[180px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessages[loadingStep]}
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

      {error && !loading && (
        <Alert variant="destructive" className="border-destructive/60">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scrape failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <LoadingStatus />}
      {result && !loading && <ResultsView result={result} />}

      {!result && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
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
  );
}
