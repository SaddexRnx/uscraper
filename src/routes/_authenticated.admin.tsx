import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_TOKENS_STORAGE_KEY,
  ADMIN_TOKEN_PREFIX,
  type AdminToken,
} from "@/lib/scraper-types";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ultra Scraper" },
      { name: "description", content: "Generate and manage trial tokens." },
      { property: "og:title", content: "Admin — Ultra Scraper" },
      { property: "og:description", content: "Generate and manage trial tokens." },
    ],
  }),
  component: AdminPage,
});

function loadTokens(): AdminToken[] {
  try {
    const raw = localStorage.getItem(ADMIN_TOKENS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminToken[]) : [];
  } catch {
    return [];
  }
}

function saveTokens(list: AdminToken[]) {
  try {
    localStorage.setItem(ADMIN_TOKENS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function generateToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `TRIAL-${hex.toUpperCase()}`;
}

function mask(token: string): string {
  if (token.length <= 10) return token;
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function AdminPage() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [quota, setQuota] = useState(50);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (hydrated && !user?.isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hydrated, user, navigate]);

  useEffect(() => {
    setTokens(loadTokens());
  }, []);

  if (!user?.isAdmin) return null;

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));
    const t: AdminToken = {
      token: generateToken(),
      quotaLimit: Math.max(1, Math.floor(quota) || 50),
      quotaUsed: 0,
      createdAt: Date.now(),
    };
    const next = [t, ...tokens];
    setTokens(next);
    saveTokens(next);
    setCreating(false);
    toast.success("Token generated", {
      description: t.token,
      action: {
        label: "Copy",
        onClick: () => {
          void navigator.clipboard.writeText(t.token);
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate trial tokens and monitor usage across your team.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Generate trial token</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tokens starting with <code className="font-mono">{ADMIN_TOKEN_PREFIX}</code> grant admin access.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="quota">Quota limit</Label>
            <Input
              id="quota"
              type="number"
              min={1}
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="h-11"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating}
            size="lg"
            className="h-11 sm:min-w-[200px]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate token
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Tokens</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {tokens.length} token{tokens.length === 1 ? "" : "s"} issued.
          </p>
        </div>
        {tokens.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No tokens yet. Generate one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead className="w-32">Quota</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-48">Created</TableHead>
                <TableHead className="w-16 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((t) => {
                const exhausted = t.quotaUsed >= t.quotaLimit;
                return (
                  <TableRow key={t.token}>
                    <TableCell className="font-mono text-xs">{mask(t.token)}</TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {t.quotaUsed} / {t.quotaLimit}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={exhausted ? "destructive" : "default"}
                        className={
                          exhausted
                            ? ""
                            : "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                        }
                      >
                        {exhausted ? "Exhausted" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {new Date(t.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={async () => {
                          await navigator.clipboard.writeText(t.token);
                          toast.success("Token copied");
                        }}
                        aria-label="Copy token"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
