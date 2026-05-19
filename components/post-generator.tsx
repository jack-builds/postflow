"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

import { GeneratedPosts } from "./generated-posts";

export function PostGenerator() {
  const [loading, setLoading] =
    useState(false);

  const [posts, setPosts] = useState<
    string[]
  >([]);

  async function handleGenerate() {
    setLoading(true);

    try {
      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            summary:
              "- Added GitHub OAuth\n- Built dashboard shell\n- Added commit selector",

            stage: "building",

            tone: "technical",

            extraInstructions:
              "Keep posts concise and developer-native.",

            postCount: 3,
          }),
        }
      );

      const data = await res.json();

      const parsedPosts =
        data.result
          .split("\n\n")
          .filter(Boolean);

      setPosts(parsedPosts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <Button onClick={handleGenerate}>
        Generate Posts
      </Button>

      {posts.length > 0 && (
        <GeneratedPosts
          posts={posts}
        />
      )}
    </div>
  );
}