import { RepoSelector } from "@/components/repo-selector";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="text-zinc-400">
          Connect development activity into Postflow.
        </p>
      </div>

      <RepoSelector />
    </div>
  );
}