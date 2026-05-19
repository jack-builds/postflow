"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Analyzing selected commits...",
  "Structuring development context...",
  "Generating technical variants...",
  "Finalizing post candidates...",
];

export function LoadingState() {
  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev < loadingMessages.length - 1
          ? prev + 1
          : prev
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-10">
      {/* Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />

      {/* Messages */}
      <div className="space-y-4 text-center">
        {loadingMessages.map(
          (message, index) => (
            <p
              key={message}
              className={`text-sm transition-all duration-300 ${
                index === activeIndex
                  ? "text-zinc-100"
                  : "text-zinc-600"
              }`}
            >
              {message}
            </p>
          )
        )}
      </div>
    </div>
  );
}