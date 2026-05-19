import { CommitSelector } from "@/components/commit-selector";

import { GenerationSettings } from "@/components/generation-settings";

import { PostGenerator } from "@/components/post-generator";

export default function NewPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Posts
        </h1>

        <p className="text-zinc-400">
          Turn development activity into
          clean developer content.
        </p>
      </div>

      <CommitSelector />

      <GenerationSettings />

      <PostGenerator />
    </div>
  );
}