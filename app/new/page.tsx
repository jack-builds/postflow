"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";


interface Post {
  id: string;
  content: string;
  repo: string;
  tone: string;
  status: string;
  created_at: string;
}

interface Session {
  user: { id: string; };
  provider_token?: string | null;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
}



interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export default function NewPage() {
  // -----------------------
  // AUTH
  // -----------------------
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------
  // REPOS
  // -----------------------
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] =
    useState<Repo | null>(null);

  const [reposExpanded, setReposExpanded] =
    useState(true);

  const [loadingRepos, setLoadingRepos] =
    useState(false);

  // -----------------------
  // COMMITS
  // -----------------------
  const [commits, setCommits] = useState<Commit[]>([]);

  const [loadingCommits, setLoadingCommits] =
    useState(false);

  const [selectedCommits, setSelectedCommits] =
    useState<Commit[]>([]);

  // -----------------------
  // GENERATION
  // -----------------------
  const [generatedPosts, setGeneratedPosts] =
    useState<Post[]>([]);

  const [generating, setGenerating] =
    useState(false);

  // -----------------------
  // SETTINGS
  // -----------------------
  const [tone, setTone] = useState("dev");

  const [postCount, setPostCount] =
    useState(3);

  const [extraInstructions, setExtraInstructions] =
    useState("");

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

    const {
      data: { subscription },
    } = getSupabaseBrowserClient().auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------
  // CONNECT GITHUB
  // -----------------------
  const connectGitHub = async () => {
    await getSupabaseBrowserClient().auth.signInWithOAuth({
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
  const fetchRepos = useCallback(async () => {
    const token = session?.provider_token;

    if (!token) return;

    setLoadingRepos(true);

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
    setLoadingRepos(false);
  }, [session?.provider_token]);

  // -----------------------
  // FETCH COMMITS
  // -----------------------
  const fetchCommits = useCallback(async (repo: Repo) => {
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
  }, [session?.provider_token]);

  // -----------------------
  // TOGGLE COMMIT
  // -----------------------
  const toggleCommit = useCallback((commit: Commit) => {
    setSelectedCommits((prev) => {
      const exists = prev.find(
        (c) => c.sha === commit.sha
      );

      if (exists) {
        return prev.filter(
          (c) => c.sha !== commit.sha
        );
      }

      return [...prev, commit];
    });
  }, [setSelectedCommits]);

  // -----------------------
  // GENERATE POSTS
  // -----------------------
  const generatePosts = async () => {
    if (!selectedCommits.length) return;
    const {
      data: { session },
    } = await getSupabaseBrowserClient().auth.getSession();

    setGenerating(true);

    try {
      const res = await fetch(
        "/api/generate-posts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            commits: selectedCommits,
            tone,
            count: postCount,
            extraInstructions,
            repo: selectedRepo?.full_name,
            userId: session?.user?.id,
          }),
        }
      );

      const data = await res.json();

      setGeneratedPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }

    setGenerating(false);
  };

  // -----------------------
  // SORT REPOS
  // -----------------------
  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [repos]);

  // -----------------------
  // AUTO FETCH REPOS
  // -----------------------

  useEffect(() => {
    if (session?.provider_token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRepos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.provider_token]);

  // -----------------------
  // LOADING
  // -----------------------
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading Postflow...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Posts
        </h1>

        <p className="text-zinc-400">
          Turn development activity into clean
          developer content.
        </p>
      </div>

      {/* CONTEXT SECTION */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-semibold">
            Select Development Context
          </h2>

          <p className="text-sm text-zinc-500">
            Choose repositories and commits to
            build context for generation.
          </p>
        </div>

        {/* NOT CONNECTED */}
        {!session && (
          <button
            onClick={connectGitHub}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Connect GitHub
          </button>
        )}

        {/* CONNECTED */}
        {session && (
          <div className="space-y-6">
            {/* REPO HEADER */}
            <button
              onClick={() =>
                setReposExpanded(!reposExpanded)
              }
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div>
                <div className="font-medium">
                  {selectedRepo
                    ? selectedRepo.name
                    : "Select Repository"}
                </div>

                <div className="text-xs text-zinc-500">
                  {selectedRepo
                    ? "Repository selected"
                    : `${repos.length} repositories available`}
                </div>
              </div>

              <div className="text-zinc-400">
                {reposExpanded ? "−" : "+"}
              </div>
            </button>

            {/* REPO LIST */}
            {reposExpanded && (
              <div className="grid gap-2">
                {loadingRepos && (
                  <div className="text-sm text-zinc-500">
                    Loading repositories...
                  </div>
                )}

                {sortedRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      setReposExpanded(false);
                      fetchCommits(repo);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedRepo?.id === repo.id
                        ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="font-medium">
                      {repo.name}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      {repo.full_name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* COMMITS */}
            {selectedRepo && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Recent Commits
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Select commits to include in
                    generation context.
                  </p>
                </div>

                {loadingCommits && (
                  <div className="text-sm text-zinc-500">
                    Loading commits...
                  </div>
                )}

                <div className="space-y-2">
                  {commits.map((commit: Commit) => {
                    const isSelected =
                      selectedCommits.some(
                        (c) => c.sha === commit.sha
                      );

                    return (
                      <button
                        key={commit.sha}
                        onClick={() =>
                          toggleCommit(commit)
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div className="font-medium">
                          {commit.commit.message}
                        </div>

                        <div className="mt-1 text-xs text-zinc-500">
                          {
                            commit.commit.author
                              .name
                          }{" "}
                          •{" "}
                          {new Date(
                            commit.commit.author.date
                          ).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CONTEXT COUNT */}
                {selectedCommits.length > 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                    {selectedCommits.length} commit
                    {selectedCommits.length > 1
                      ? "s"
                      : ""}{" "}
                    selected for generation
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GENERATION SETTINGS */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Generation Settings
          </h2>

          <p className="text-sm text-zinc-500">
            Configure how posts should be
            generated.
          </p>
        </div>

        <div className="space-y-6">
          {/* TONE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tone
            </label>

            <select
              value={tone}
              onChange={(e) =>
                setTone(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="dev">
                Developer
              </option>

              <option value="casual">
                Casual
              </option>

              <option value="technical">
                Technical
              </option>
            </select>
          </div>

          {/* POST COUNT */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Number of Posts
            </label>

            <input
              type="range"
              min={1}
              max={5}
              value={postCount}
              onChange={(e) =>
                setPostCount(Number(e.target.value))
              }
              className="w-full"
            />

            <div className="text-sm text-zinc-500">
              Generate {postCount} posts.
            </div>
          </div>

          {/* EXTRA INSTRUCTIONS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Extra Instructions
            </label>

            <textarea
              value={extraInstructions}
              onChange={(e) =>
                setExtraInstructions(e.target.value)
              }
              placeholder="e.g. Make them funny and engaging."
              rows={3}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={generatePosts}
            disabled={!selectedCommits.length || generating}
            className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Posts"}
          </button>
        </div>
      </div>

      {/* GENERATED POSTS */}
      {generatedPosts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Generated Posts
            </h2>

            <p className="text-sm text-zinc-500">
              Review generated content before
              approving.
            </p>
          </div>

          <div className="space-y-4">
            {generatedPosts.map(
              (post: Post, index: number) => (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-3 text-xs text-zinc-500">
                    {post.tone || tone}
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7">
                    {post.content}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
