type Post = {
  tone: string;
  content: string;
};

export function safeParsePosts(raw: string): Post[] {
  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (p) =>
          typeof p === "object" &&
          typeof p.content === "string"
      )
      .map((p) => ({
        tone: typeof p.tone === "string" ? p.tone : "dev",
        content: p.content.trim(),
      }));
  } catch (err) {
    console.error("❌ Failed to parse AI output:", raw);

    return [];
  }
}