import { CommitSelector } from "@/components/commit-selector";

export default function NewPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Posts
        </h1>

        <p className="text-zinc-400">
          Select commits and generate content.
        </p>
      </div>

      <CommitSelector />
    </div>
  );
}