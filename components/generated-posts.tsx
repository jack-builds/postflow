"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type GeneratedPostsProps = {
  posts: string[];
};

export function GeneratedPosts({
  posts,
}: GeneratedPostsProps) {
  const [approvedPosts, setApprovedPosts] =
    useState<string[]>([]);

  function toggleApproval(post: string) {
    setApprovedPosts((prev) =>
      prev.includes(post)
        ? prev.filter((p) => p !== post)
        : [...prev, post]
    );
  }

  async function copyPost(
    post: string
  ) {
    await navigator.clipboard.writeText(
      post
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <Card
          key={index}
          className="space-y-6"
        >
          {/* Content */}
          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">
            {post}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                copyPost(post)
              }
            >
              Copy
            </Button>

            <Button
              variant="secondary"
            >
              Regenerate
            </Button>

            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={approvedPosts.includes(
                  post
                )}
                onChange={() =>
                  toggleApproval(post)
                }
              />

              Approve
            </label>
          </div>
        </Card>
      ))}
    </div>
  );
}