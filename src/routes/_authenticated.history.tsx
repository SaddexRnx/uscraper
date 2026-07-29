import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, ExternalLink, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HISTORY_STORAGE_KEY, type HistoryItem } from "@/lib/scraper-types";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — Ultra Scraper" },
      { name: "description", content: "Review your recent scrape jobs." },
      { property: "og:title", content: "History — Ultra Scraper" },
      { property: "og:description", content: "Review your recent scrape jobs." },
    ],
  }),
  component: HistoryPage,
});

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const clearAll = () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setItems([]);
    toast.success("History cleared");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recent scrape jobs, stored locally on this device.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
              <HistoryIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium">No scrapes yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Your scraping history will show up here once you start.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Date</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead className="hidden lg:table-cell">Selectors</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="hidden md:table-cell w-40">Method</TableHead>
                <TableHead className="w-16 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {new Date(it.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate font-mono text-xs" title={it.url}>
                    {it.url}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {it.selectors.slice(0, 3).map((s) => (
                        <code
                          key={s}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                        >
                          {s}
                        </code>
                      ))}
                      {it.selectors.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{it.selectors.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={it.status === "success" ? "default" : "destructive"}
                      className={
                        it.status === "success"
                          ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {it.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="font-mono text-xs text-muted-foreground">
                      {it.method_used}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
                      aria-label="Open target URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
