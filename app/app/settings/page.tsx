"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading Settings...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* PROFILE SECTION */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email</label>
              <div className="mt-1 text-sm font-medium">{user?.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Connected Accounts</label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-800">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  GitHub
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREFERENCES SECTION */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Default Tone</div>
                <div className="text-xs text-zinc-500">Choose your preferred writing style for new posts.</div>
              </div>
              <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <option value="dev">Developer</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-Draft</div>
                <div className="text-xs text-zinc-500">Automatically create drafts when new commits are detected.</div>
              </div>
              <div className="h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-800 relative cursor-not-allowed">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="rounded-2xl border border-red-100 bg-red-50/30 p-6 dark:border-red-900/30 dark:bg-red-900/10">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <button 
              onClick={handleSignOut}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
