export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAV */}
      <header className="flex items-center justify-between px-8 py-5 border-b">
        <div className="font-semibold tracking-tight">
          Postflow
        </div>

        <div className="flex gap-6 text-sm text-gray-600">
          <a href="/dashboard" className="hover:text-black transition">
            Dashboard
          </a>
          <a href="/pricing" className="hover:text-black transition">
            Pricing
          </a>
          <a href="/new" className="hover:text-black transition">
            Get Started
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Turn your dev progress into a consistent content workflow
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Postflow captures what you build, structures it automatically, and turns it into build-in-public posts.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="/new" className="px-6 py-3 bg-black text-white rounded-xl text-sm hover:opacity-90 transition inline-block">
            Start building workflow
          </a>

          <a href="#features" className="px-6 py-3 border rounded-xl text-sm hover:bg-gray-50 transition inline-block">
            Learn how it works
          </a>
        </div>
      </section>

      {/* PRODUCT EXPLANATION */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="text-sm text-gray-600 space-y-6">

          <p>
            Postflow is not a post generator. It is a workflow layer between building and sharing.
          </p>

          <p>
            You capture what you build. Postflow structures it. Then it generates consistent dev content automatically.
          </p>

          <p>
            No thinking about posts. No blank page. Just build → capture → publish.
          </p>

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-3xl mx-auto px-6 pb-24 grid gap-4 text-center">
        <div className="text-sm text-gray-600">
          ✦ Capture dev progress in seconds
        </div>
        <div className="text-sm text-gray-600">
          ✦ Turn builds into structured content automatically
        </div>
        <div className="text-sm text-gray-600">
          ✦ Designed for consistent build-in-public workflows
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-12 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-bold mb-4">Ready to build in public?</h2>
          <p className="text-gray-600 mb-6">
            Start for free, upgrade to Pro anytime. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/new" className="px-6 py-3 bg-black text-white rounded-xl text-sm hover:opacity-90 transition inline-block">
              Get Started Free
            </a>
            <a href="/pricing" className="px-6 py-3 border border-black rounded-xl text-sm hover:bg-black hover:text-white transition inline-block">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 text-center text-xs text-gray-500 space-y-2">
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="text-gray-600 hover:text-black transition">Dashboard</a>
          <a href="/pricing" className="text-gray-600 hover:text-black transition">Pricing</a>
          <a href="/new" className="text-gray-600 hover:text-black transition">Create Posts</a>
        </div>
        <div>Postflow — build → capture → share</div>
        <div className="text-[10px] text-gray-400">
          A workflow tool for developers building in public
        </div>
      </footer>

    </main>
  );
}
