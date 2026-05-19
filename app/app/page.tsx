"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AppPage() {
  // -----------------------
  // STATE
  // -----------------------
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const [commits, setCommits] = useState<any[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // 🆕 CONTEXT ENGINE STATE
  const [context, setContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // -----------------------
  // AUTH: LOAD SESSION
  // -----------------------
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------
  // GITHUB LOGIN
  // -----------------------
  const connectGitHub = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // -----------------------
  // FETCH REPOS
  // -----------------------
  const fetchRepos = async () => {
    const token = session?.provider_token;

    if (!token) {
      console.log("No GitHub token found");
      return;
    }

    setLoadingRepos(true);

    const res = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setRepos(data);
    setLoadingRepos(false);
  };

  // -----------------------
  // CONTEXT ENGINE
  // -----------------------
  const buildContext = async (commits: any[]) => {
    if (!commits?.length) return;

    setLoadingContext(true);

    const commitMessages = commits
      .slice(0, 10)
      .map((c: any) => c.commit.message)
      .join("\n");

    const prompt = `
You are a senior developer and technical writer.

Convert these git commits into structured content for a SaaS called Postflow.

COMMITS:
${commitMessages}

Return JSON ONLY in this exact format:

{
  "developerNarrative": "string (what the developer is building overall)",
  "whatChanged": ["bullet 1", "bullet 2", "bullet 3"],
  "suggestedPosts": {
    "dev": "short dev-focused post",
    "casual": "simple human explanation",
    "technical": "more detailed technical breakdown"
  },
  "tone": "dev | casual | technical"
}

Rules:
- no emojis
- no marketing language
- no fluff
- write like a real engineer
`;

    const res = await fetch("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    try {
      setContext(JSON.parse(data.result));
    } catch (e) {
      console.log("Context parse error", data.result);
    }

    setLoadingContext(false);
  };

  // -----------------------
  // FETCH COMMITS
  // -----------------------
  const fetchCommits = async (repo: any) => {
    const token = session?.provider_token;

    if (!token || !repo) return;

    setLoadingCommits(true);

    const res = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setCommits(data);
    setLoadingCommits(false);

    // IMPORTANT: run context AFTER commits are set
    setTimeout(() => {
      buildContext(data);
    }, 0);
  };

  // -----------------------
  // AUTO FETCH REPOS AFTER LOGIN
  // -----------------------
  useEffect(() => {
    if (session) {
      fetchRepos();
    }
  }, [session]);

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        Loading Postflow...
      </div>
    );
  }

  // -----------------------
  // NOT LOGGED IN
  // -----------------------
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold">Postflow</h1>
        <p className="text-sm text-zinc-500">
          Connect GitHub to continue
        </p>

        <button
          onClick={connectGitHub}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  // -----------------------
  // DASHBOARD
  // -----------------------
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Select a repo to start generating posts
        </p>
      </div>

      {/* REPOS */}
      {loadingRepos && (
        <div className="text-sm text-zinc-500">
          Loading repositories...
        </div>
      )}

      <div className="grid gap-2">
        {repos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => {
              setSelectedRepo(repo);
              fetchCommits(repo);
            }}
            className={`text-left rounded-lg border p-3 text-sm hover:bg-zinc-50 ${
              selectedRepo?.id === repo.id ? "border-black" : ""
            }`}
          >
            <div className="font-medium">{repo.name}</div>
            <div className="text-xs text-zinc-500">
              {repo.full_name}
            </div>
          </button>
        ))}
      </div>

      {/* SELECTED REPO */}
      {selectedRepo && (
        <div className="mt-6 rounded-lg border p-4 text-sm">
          Selected repo:
          <span className="font-medium">
            {" "}
            {selectedRepo.full_name}
          </span>
        </div>
      )}

      {/* COMMITS */}
      {selectedRepo && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold">
            Recent commits
          </h2>

          {loadingCommits && (
            <div className="text-sm text-zinc-500">
              Loading commits...
            </div>
          )}

          <div className="space-y-2">
            {commits.map((commit: any) => (
              <div
                key={commit.sha}
                className="rounded-lg border p-3 text-sm"
              >
                <div className="font-medium">
                  {commit.commit.message}
                </div>
                <div className="text-xs text-zinc-500">
                  {commit.commit.author.name} •{" "}
                  {new Date(
                    commit.commit.author.date
                  ).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🧠 CONTEXT ENGINE OUTPUT */}
      {context && (
        <div className="mt-10 rounded-lg border p-4 text-sm">
          <h2 className="mb-2 font-semibold">
            Context Engine Output
          </h2>

          <pre className="whitespace-pre-wrap text-xs text-zinc-600">
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}