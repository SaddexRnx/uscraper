import { useEffect, useMemo } from "react";
import {
  Outlet,
  createFileRoute,
  useNavigate,
  Link,
  useLocation,
} from "@tanstack/react-router";
import {
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

type NavLink = {
  to: "/dashboard" | "/history" | "/settings" | "/admin";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const NAV: NavLink[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

function AuthenticatedLayout() {
  const { token, user, quota, hydrated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hydrated && !token) {
      navigate({ to: "/login", replace: true });
    }
  }, [hydrated, token, navigate]);

  const visibleNav = useMemo(
    () => NAV.filter((n) => !n.adminOnly || user?.isAdmin),
    [user],
  );

  const quotaPct = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;
  const overQuota = quota.used >= quota.limit;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  if (!hydrated || !token) {
    return <div className="min-h-screen bg-background" />;
  }

  const initials = (user?.username ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Ultra Scraper</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {visibleNav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Gauge className="h-3.5 w-3.5" />
                Quota
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  overQuota ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {quota.used}/{quota.limit}
              </span>
            </div>
            <Progress
              value={quotaPct}
              className={cn("h-1.5", overQuota && "[&>*]:bg-destructive")}
            />
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur md:pl-60 supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Ultra Scraper</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              Welcome back, <span className="text-foreground">{user?.username}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "hidden sm:flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                overQuota
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span className="font-mono tabular-nums">
                {quota.used} / {quota.limit}
              </span>
              <span>scrapes</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold">
              {initials}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="md:pl-60 pb-20 md:pb-6">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <div className="grid grid-cols-4">
          {visibleNav.slice(0, 4).map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
