import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  API_URL_STORAGE_KEY,
  DEFAULT_API_URL,
  PROXY_STORAGE_KEY,
  type ProxyProvider,
  type ProxySettings,
} from "@/lib/scraper-types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ultra Scraper" },
      { name: "description", content: "Configure your proxy provider and backend API." },
      { property: "og:title", content: "Settings — Ultra Scraper" },
      { property: "og:description", content: "Configure your proxy provider and backend API." },
    ],
  }),
  component: SettingsPage,
});

const PROVIDERS: { value: ProxyProvider; label: string }[] = [
  { value: "free", label: "Free Tier (Default)" },
  { value: "scraperapi", label: "ScraperAPI" },
  { value: "zenrows", label: "ZenRows" },
  { value: "scrapingbee", label: "ScrapingBee" },
];

function SettingsPage() {
  const [proxy, setProxy] = useState<ProxySettings>({ provider: "free", apiKey: "" });
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROXY_STORAGE_KEY);
      if (raw) setProxy(JSON.parse(raw));
      const savedApi = localStorage.getItem(API_URL_STORAGE_KEY);
      if (savedApi) setApiUrl(savedApi);
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(PROXY_STORAGE_KEY, JSON.stringify(proxy));
      localStorage.setItem(API_URL_STORAGE_KEY, apiUrl.trim() || DEFAULT_API_URL);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const needsKey = proxy.provider !== "free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your proxy provider and backend endpoint.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Bring Your Own Proxy (BYOK)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The Free Tier works for most sites. For heavily protected sites (Walmart, IMDb),
              add your own proxy API key to guarantee success.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="provider">Proxy provider</Label>
            <Select
              value={proxy.provider}
              onValueChange={(v) => setProxy((p) => ({ ...p, provider: v as ProxyProvider }))}
            >
              <SelectTrigger id="provider" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API key</Label>
            <Input
              id="api-key"
              type="password"
              value={proxy.apiKey}
              onChange={(e) => setProxy((p) => ({ ...p, apiKey: e.target.value }))}
              placeholder={needsKey ? "Paste your provider API key" : "Not required for Free Tier"}
              disabled={!needsKey}
              className="h-11 font-mono text-sm"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Stored locally on this device. Sent as <code className="font-mono">proxy_config</code>{" "}
              with each scrape.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Backend endpoint</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Point Ultra Scraper at a different FastAPI backend.
        </p>
        <div className="mt-5 space-y-2">
          <Label htmlFor="api-url">Backend API URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={DEFAULT_API_URL}
            spellCheck={false}
            className="h-11 font-mono text-sm"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button size="lg" onClick={save} className="h-11 min-w-[140px]">
          <Save className="mr-2 h-4 w-4" />
          Save changes
        </Button>
      </div>
    </div>
  );
}
