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
        <aside className="w-64 border-r border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-6">
            <h1 className="text-lg font-semibold">
              Postflow
            </h1>
            <p className="text-xs text-zinc-500">
              Build in public engine
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              href="/app"
              className="block rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>

            <Link
              href="/app/new"
              className="block rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Create
            </Link>

            <Link
              href="/app/posts"
              className="block rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Posts
            </Link>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}