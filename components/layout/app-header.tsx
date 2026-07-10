"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { logout } from "@/app/(auth)/actions";
import { HelpDrawer } from "@/components/help/help-drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };

const LINKS: NavItem[] = [
  { label: "Aujourd'hui", href: "/dashboard" },
  { label: "Dates", href: "/opportunities" },
  { label: "Contacts", href: "/contacts" },
  { label: "Prospection", href: "/outreach" },
  { label: "Tâches", href: "/tasks" },
  { label: "Réglages", href: "/settings" },
];

export function AppHeader({
  workspaceName,
  unreadInbox = 0,
}: {
  workspaceName: string;
  unreadInbox?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const showBadge = (href: string) => href === "/outreach" && unreadInbox > 0;

  return (
    <header className="relative border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            Booking&nbsp;OS
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive(l.href)
                    ? "font-medium text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {l.label}
                {showBadge(l.href) && (
                  <Badge className="h-4 min-w-4 px-1 text-[10px]">
                    {unreadInbox}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {workspaceName}
          </span>
          <HelpDrawer />
          <form action={logout} className="hidden sm:block">
            <Button type="submit" variant="ghost" size="sm">
              Déconnexion
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground sm:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-14 z-40 border-b bg-background shadow-sm sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-2",
                  isActive(l.href)
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {l.label}
                {showBadge(l.href) && (
                  <Badge className="h-4 min-w-4 px-1 text-[10px]">
                    {unreadInbox}
                  </Badge>
                )}
              </Link>
            ))}
            <form action={logout} className="mt-1 border-t pt-1">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                Déconnexion
              </Button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
