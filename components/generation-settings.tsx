"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export function GenerationSettings() {
  const [postCount, setPostCount] =
    useState(3);

  const [tone, setTone] =
    useState("technical");

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">
          Generation Settings
        </h2>

        <p className="text-sm text-zinc-500">
          Configure post generation behavior.
        </p>
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">
          Tone
        </p>

        <div className="flex gap-3">
          {[
            "technical",
            "casual",
            "builder",
            "minimal",
          ].map((option) => (
            <button
              key={option}
              onClick={() =>
                setTone(option)
              }
              className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                tone === option
                  ? "border-white bg-white text-black"
                  : "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <Slider
        value={postCount}
        onChange={setPostCount}
      />

      {/* Instructions */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">
          Extra Instructions
        </p>

        <textarea
          placeholder="Optional instructions..."
          className="min-h-[120px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
        />
      </div>
    </Card>
  );
}