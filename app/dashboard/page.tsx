"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  repo: string;
  tone: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    approved: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) return;

    // Fetch recent posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!postsError && postsData) {
      setPosts(postsData);
    }

    // Fetch stats
    const { data: allPosts, error: statsError } = await supabase
      .from("posts")
      .select("status")
      .eq("user_id", userId);

    if (!statsError && allPosts) {
      setStats({
        total: allPosts.length,
        drafts: allPosts.filter((p) => p.status === "draft").length,
        approved: allPosts.filter((p) => p.status === "approved").length,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-400">Welcome back! Here's an overview of your postflow activity.</p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500">Total Posts</div>
          <div className="mt-2 text-3xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500">Drafts</div>
          <div className="mt-2 text-3xl font-semibold">{stats.drafts}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium text-zinc-500">Approved</div>
          <div className="mt-2 text-3xl font-semibold">{stats.approved}</div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link href="/posts" className="text-sm text-zinc-500 hover:underline">
            View all
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500">No posts generated yet.</p>
            <Link
              href="/new"
              className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {post.repo} • {post.tone}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    post.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    post.status === 'draft' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {post.status}
                  </div>
                </div>
                <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {post.content}
                </p>
                <div className="mt-4 text-[10px] text-zinc-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
