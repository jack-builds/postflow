"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { updatePostStatus } from "@/lib/update-post-status";
import { deletePost } from "@/lib/delete-post";

type Post = {
  id: string;
  generated_post: string;
  status: "draft" | "approved" | "queued";
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  async function loadPosts() {
    const { data } = await supabaseBrowser
      .from("posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setPosts(data || []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function refresh() {
    await loadPosts();
  }

  const draftPosts = posts.filter(
    (p) => p.status === "draft"
  );

  const approvedPosts = posts.filter(
    (p) => p.status === "approved"
  );

  const queuedPosts = posts.filter(
    (p) => p.status === "queued"
  );

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Content Queue
      </h1>

      {/* DRAFTS */}
      <Section title="Drafts">
        {draftPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onRefresh={refresh}
          />
        ))}
      </Section>

      {/* APPROVED */}
      <Section title="Approved">
        {approvedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onRefresh={refresh}
          />
        ))}
      </Section>

      {/* QUEUED */}
      <Section title="Queued">
        {queuedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onRefresh={refresh}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-300">
        {title}
      </h2>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PostCard({
  post,
  onRefresh,
}: {
  post: any;
  onRefresh: () => void;
}) {
  return (
    <Card className="space-y-4">
      <p className="whitespace-pre-wrap text-sm text-zinc-200">
        {post.generated_post}
      </p>

      <div className="flex gap-2">
        {post.status !== "approved" && (
          <Button
            variant="secondary"
            onClick={async () => {
              await updatePostStatus(
                post.id,
                "approved"
              );
              onRefresh();
            }}
          >
            Approve
          </Button>
        )}

        {post.status === "approved" && (
          <Button
            variant="secondary"
            onClick={async () => {
              await updatePostStatus(
                post.id,
                "draft"
              );
              onRefresh();
            }}
          >
            Unapprove
          </Button>
        )}

        {post.status !== "queued" && (
          <Button
            variant="secondary"
            onClick={async () => {
              await updatePostStatus(
                post.id,
                "queued"
              );
              onRefresh();
            }}
          >
            Queue
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={async () => {
            await deletePost(post.id);
            onRefresh();
          }}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}