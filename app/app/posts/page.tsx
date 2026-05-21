"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Post = {
  id: string;
  content: string;
  repo: string;
  tone: string;
  status: string;
  created_at: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // -----------------------
  // LOAD SESSION
  // -----------------------
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      setSession(data.session);
    };

    loadSession();
  }, []);

  // -----------------------
  // FETCH POSTS
  // -----------------------
  const fetchPosts = async () => {
    const { data: sessionData } =
      await supabaseBrowser.auth.getSession();

    const userId = sessionData.session?.user?.id;

    if (!userId) return;

    const { data, error } = await supabaseBrowser
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data || []);
    }

    setLoading(false);
  };

  // -----------------------
  // INITIAL + REFRESH LOOP
  // -----------------------
  useEffect(() => {
    fetchPosts();

    const interval = setInterval(() => {
      fetchPosts();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------
  // LOADING
  // -----------------------
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading posts...
      </div>
    );
  }

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Your Posts
        </h1>

        <p className="text-sm text-zinc-500">
          Generated content from your development activity
        </p>
      </div>

      {/* POSTS LIST */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-sm text-zinc-500">
            No posts yet. Generate some content first.
          </div>
        )}

        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {/* HEADER */}
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <div>
                {post.repo || "unknown repo"}
              </div>

              <div className="flex gap-2">
                <span className="rounded-full border px-2 py-0.5">
                  {post.tone}
                </span>

                <span className="rounded-full border px-2 py-0.5">
                  {post.status}
                </span>
              </div>
            </div>

            {/* CONTENT */}
            <p className="whitespace-pre-wrap text-sm leading-7">
              {post.content}
            </p>

            {/* FOOTER */}
            <div className="mt-4 text-xs text-zinc-400">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}