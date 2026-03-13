"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Portfolio" },
    { href: "/research", label: "Research" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-11 flex items-center gap-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Yakiquant
        </span>
        <div className="flex gap-0.5">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
