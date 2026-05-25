import { generateContext } from "./openai";
import { buildPostPrompt } from "./build-post-prompt";

type GeneratePostsInput = {
  repo: string;
  commitMessages: string;
  tone: string;
  count: number;
  extraInstructions?: string;
};

type Post = {
  tone: string;
  content: string;
};

function safeParse(raw: string): Post[] {
  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (p) =>
          p &&
          typeof p === "object" &&
          typeof p.content === "string"
      )
      .map((p) => ({
        tone: typeof p.tone === "string" ? p.tone : "dev",
        content: p.content.trim(),
      }));
  } catch (err: unknown) {
    console.error("❌ Failed to parse AI output:", err);
    console.error(raw);
    return [];
  }
}

export async function generatePosts({
  repo,
  commitMessages,
  tone,
  count,
  extraInstructions,
}: GeneratePostsInput) {
  // -----------------------
  // BUILD PROMPT
  // -----------------------
  const prompt = buildPostPrompt({
    repo,
    commitMessages,
    tone,
    count,
    extraInstructions,
  });

  // -----------------------
  // CALL OPENAI
  // -----------------------
  const raw = await generateContext(prompt);

  // -----------------------
  // PARSE + ENFORCE
  // -----------------------
  const posts = safeParse(raw);

  // -----------------------
  // HARD GUARANTEE OUTPUT SHAPE
  // -----------------------
  if (!posts.length) {
    return [
      {
        tone: "dev",
        content:
          "No valid posts could be generated from the commit data.",
      },
    ];
  }

  // enforce count strictly
  return posts.slice(0, count);
}