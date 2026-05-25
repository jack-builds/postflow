"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Repo = {
  id: number;
  name: string;
  full_name: string;
};

export function RepoSelector() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<
    number[]
  >([]);

  useEffect(() => {
    async function loadRepos() {
            const supabase = getSupabaseBrowserClient();
      const { data: { session }, } = await supabase.auth.getSession();

      const token =
        session?.provider_token;

      if (!token) return;

      const res = await fetch(
        "https://api.github.com/user/repos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setRepos(data);
    }

    loadRepos();
  }, []);

  function toggleRepo(id: number) {
    setSelectedRepos((prev) =>
      prev.includes(id)
        ? prev.filter((repoId) => repoId !== id)
        : [...prev, id]
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">
          Select repositories
        </h2>

        <p className="text-sm text-zinc-500">
          Choose repositories to use for content generation.
        </p>
      </div>

      <div className="space-y-3">
        {repos.map((repo) => (
          <Checkbox
            key={repo.id}
            checked={selectedRepos.includes(repo.id)}
            onChange={() => toggleRepo(repo.id)}
            label={repo.full_name}
          />
        ))}
      </div>
    </Card>
  );
}