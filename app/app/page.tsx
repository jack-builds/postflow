"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  // -----------------------
  // AUTH CHECK (redirect logged-in users)
  // -----------------------
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();

      if (data.session) {
        router.push("/new"); // already logged in → skip landing
      }
    };

    checkSession();
  }, [router]);

  // -----------------------
  // GITHUB LOGIN
  // -----------------------
  const signInWithGitHub = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // -----------------------
  // SIGN OUT (included as requested)
  // NOTE: not usually used on landing page, but added per request
  // -----------------------
  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Postflow
      </h1>

      <p className="mt-3 max-w-md text-sm text-zinc-500">
        Turn your GitHub commits into clean developer content automatically.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={signInWithGitHub}
          className="rounded-xl bg-black px-5 py-2 text-sm text-white"
        >
          Continue with GitHub
        </button>

        <button
          onClick={() => router.push("/new")}
          className="rounded-xl border px-5 py-2 text-sm"
        >
          View App
        </button>
      </div>

      {/* OPTIONAL SIGN OUT (debug / dev use) */}
      <div className="mt-6">
        <button
          onClick={signOut}
          className="text-xs text-zinc-500 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}