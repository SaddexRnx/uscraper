import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MESSAGES = [
  "Connecting to backend...",
  "Sending scrape request...",
  "Bypassing anti-bot protection...",
  "Fetching target page...",
  "Extracting data with selectors...",
  "Finalizing results...",
];

export function LoadingStatus() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3 text-sm text-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="font-medium">{MESSAGES[idx]}</span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
