const loadingMessages = [
  "Analyzing commits...",
  "Structuring development context...",
  "Generating technical variants...",
  "Finalizing post candidates...",
];

export function LoadingState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

      <div className="space-y-2">
        {loadingMessages.map((message) => (
          <p
            key={message}
            className="text-sm text-zinc-400"
          >
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}