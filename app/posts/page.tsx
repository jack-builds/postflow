"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Session {
  user: { id: string; };
}

interface Post {
  id: string;
  content: string;
  repo: string;
  tone: string;
  status: string;
  created_at: string;
}

export default function PostsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);


  // -----------------------
  // LOAD SESSION
  // -----------------------
  useEffect(() => {
    const loadSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();
  }, []);



  // -----------------------
  // FETCH POSTS
  // -----------------------
  const fetchPosts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } =
      await supabase.auth.getSession();

    const userId = sessionData.session?.user?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE FETCH ERROR:", error);
      return;
    }

    setPosts(data || []);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPosts();
    }
  }, [session?.user?.id, fetchPosts]);



  // -----------------------
  // LOADING
  // -----------------------
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading Posts...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Posts
        </h1>

        <p className="text-zinc-400">
          All of your generated posts in one
          place.
        </p>
      </div>

      {/* POSTS */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-3 text-xs text-zinc-500">
              {post.tone}
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7">
              {post.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
