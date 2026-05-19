import type { ReactNode } from "react";
import Link from "next/link";

const navItems = [
  {
    href: "/app",
    label: "Dashboard",
  },
  {
    href: "/app/new",
    label: "Create",
  },
  {
    href: "/app/posts",
    label: "Posts",
  },
  {
    href: "/app/settings",
    label: "Settings",
  },
];

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-zinc-900 lg:flex lg:flex-col">
        <div className="border-b border-zinc-900 px-6 py-5">
          <Link
            href="/app"
            className="text-lg font-semibold tracking-tight"
          >
            Postflow
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-3 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-900 px-6">
          <div>
            <p className="text-sm text-zinc-500">
              Developer workflow automation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}