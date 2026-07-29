import { History, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HistoryItem } from "@/lib/scraper-types";

type Props = {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
};

function hostname(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

export function HistoryPanel({ items, onSelect, onClear }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Recent Scrapes</h3>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} aria-label="Clear history">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Your successful scrapes will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.timestamp} className="p-3">
              <button
                type="button"
                onClick={() => onSelect(it)}
                className="group w-full text-left rounded-md p-2 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {hostname(it.url)}
                  </span>
                  <Play className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono truncate" title={it.url}>
                  {it.url}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {it.selectors.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {s.length > 22 ? s.slice(0, 22) + "…" : s}
                    </span>
                  ))}
                  {it.selectors.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{it.selectors.length - 3}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
