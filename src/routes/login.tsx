import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, MessageCircle, Send, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Ultra Scraper" },
      { name: "description", content: "Sign in to Ultra Scraper with a trial token or Telegram." },
      { property: "og:title", content: "Sign in — Ultra Scraper" },
      { property: "og:description", content: "Sign in to Ultra Scraper with a trial token or Telegram." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, token, hydrated } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (hydrated && token) navigate({ to: "/dashboard", replace: true });
  }, [hydrated, token, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t) {
      toast.error("Enter a valid token");
      return;
    }
    const user = login(t);
    toast.success(`Welcome, ${user.username}`);
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card">
            <Zap className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ultra Scraper</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Professional web scraping, made simple.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="token">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="token">
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                Trial Token
              </TabsTrigger>
              <TabsTrigger value="telegram">
                <Send className="mr-2 h-3.5 w-3.5" />
                Telegram
              </TabsTrigger>
            </TabsList>

            <TabsContent value="token" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Trial token</Label>
                  <Input
                    id="token"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Paste your token"
                    className="h-11 font-mono text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Tokens starting with <code className="font-mono">ADMIN-</code> unlock the admin panel.
                  </p>
                </div>
                <Button type="submit" size="lg" className="h-11 w-full">
                  Log in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="telegram" className="mt-5">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in instantly with your Telegram account. The official widget will open in a popup.
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => toast.info("Telegram login will be enabled soon.")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Log in with Telegram
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We'll never post to your account.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <a
          href="https://t.me/Saddex_x"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50">
              <MessageCircle className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Need a code?</p>
              <p className="text-xs text-muted-foreground">
                Contact admin on Telegram: <span className="font-mono">@Saddex_x</span>
              </p>
            </div>
          </div>
          <Send className="h-4 w-4 text-muted-foreground" />
        </a>


        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms of service and acceptable use policy.
        </p>
      </div>
    </div>
  );
}
