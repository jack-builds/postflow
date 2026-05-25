"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
};

export function CommitSelector() {
  const [commits, setCommits] = useState<
    Commit[]
  >([]);

  const [selectedCommits, setSelectedCommits] =
    useState<string[]>([]);

  useEffect(() => {
    async function loadCommits() {
      const supabase = getSupabaseBrowserClient();
      const { data: { session }, } = await supabase.auth.getSession();

      const token =
        session?.provider_token;

      if (!token) return;

      // TEMP HARDCODED REPO
      const owner = "YOUR_GITHUB_USERNAME";
      const repo = "YOUR_REPO_NAME";

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setCommits(data.slice(0, 10));
    }

    loadCommits();
  }, []);

  function toggleCommit(sha: string) {
    setSelectedCommits((prev) =>
      prev.includes(sha)
        ? prev.filter((id) => id !== sha)
        : [...prev, sha]
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">
          Select development context
        </h2>

        <p className="text-sm text-zinc-500">
          Choose commits to generate posts from.
        </p>
      </div>

      <div className="space-y-3">
        {commits.map((commit) => (
          <Checkbox
            key={commit.sha}
            checked={selectedCommits.includes(
              commit.sha
            )}
            onChange={() =>
              toggleCommit(commit.sha)
            }
            label={commit.commit.message}
          />
        ))}
      </div>
    </Card>
  );
}