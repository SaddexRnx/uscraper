import { useState } from "react";
import { Copy, Check, Download, FileJson, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ScrapeResponse } from "@/lib/scraper-types";

type Props = { result: ScrapeResponse };

function methodVariant(method: string): "default" | "secondary" | "outline" {
  if (method === "curl_cffi") return "default";
  if (method === "stealthy_fallback") return "secondary";
  return "outline";
}

function CopyButton({ text, label = "item" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success(`Copied ${label}`);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Failed to copy");
        }
      }}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toCsv(data: Record<string, string[]>): string {
  const rows: string[] = ["selector,index,value"];
  for (const [sel, items] of Object.entries(data)) {
    items.forEach((v, i) => {
      const esc = `"${String(v).replace(/"/g, '""')}"`;
      rows.push(`"${sel.replace(/"/g, '""')}",${i},${esc}`);
    });
  }
  return rows.join("\n");
}

export function ResultsView({ result }: Props) {
  const entries = Object.entries(result.data ?? {});
  const totalItems = entries.reduce((n, [, v]) => n + v.length, 0);

  return (
    <div className="space-y-4">
      {/* Metadata banner */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {result.status} {result.status === 200 ? "OK" : ""}
              </Badge>
              <Badge variant={methodVariant(result.method_used)} className="font-mono">
                {result.method_used}
              </Badge>
              <Badge variant={result.cached ? "secondary" : "outline"}>
                {result.cached ? "Cached" : "Fresh"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {totalItems} item{totalItems === 1 ? "" : "s"} across {entries.length} selector{entries.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="truncate text-sm text-muted-foreground font-mono" title={result.url}>
              {result.url}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                download(
                  `scrape-${Date.now()}.json`,
                  JSON.stringify(result, null, 2),
                  "application/json",
                )
              }
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => download(`scrape-${Date.now()}.csv`, toCsv(result.data ?? {}), "text/csv")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Selector groups */}
      <div className="space-y-4">
        {entries.map(([selector, items]) => (
          <div key={selector} className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-medium text-foreground truncate">{selector}</code>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({items.length} item{items.length === 1 ? "" : "s"})
                  </span>
                </div>
              </div>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(items.join("\n"));
                    toast.success(`Copied ${items.length} items`);
                  }}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Copy all
                </Button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="flex items-start gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>No data found. The site may have served a CAPTCHA or the selector is incorrect.</span>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <ul className="divide-y divide-border">
                  {items.map((text, i) => (
                    <li key={i} className="flex items-start gap-2 px-4 py-2.5">
                      <span className="mt-0.5 w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-foreground break-words whitespace-pre-wrap">
                        {text}
                      </span>
                      <CopyButton text={text} />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
