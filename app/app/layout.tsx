import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-zinc-950 dark:text-white">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="fixed h-screen w-64 border-r border-zinc-200 p-6 dark:border-zinc-800">
          <div className="mb-10">
            <Link href="/app" className="block">
              <h1 className="text-xl font-bold tracking-tight">Postflow</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mt-1">
                Build in public engine
              </p>
            </Link>
          </div>

          <nav className="space-y-1 text-sm">
            <Link
              href="/app"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>

            <Link
              href="/app/new"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Create
            </Link>

            <Link
              href="/app/posts"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Posts
            </Link>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-900">
              <Link
                href="/app/settings"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              >
                Settings
              </Link>
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 ml-64 p-10 min-h-screen">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
