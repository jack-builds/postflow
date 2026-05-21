type PromptOptions = {
  repo: string;
  commitMessages: string;
  tone: string;
  extraInstructions?: string;
  count: number;
};

export function buildPostPrompt({
  repo,
  commitMessages,
  tone,
  extraInstructions,
  count,
}: PromptOptions) {
  return `
You are an expert technical writer helping a developer turn git activity into high-quality build-in-public posts.

Repository:
${repo}

Git Commits:
${commitMessages}

Tone:
${tone}

Extra Instructions:
${extraInstructions || "None"}

Generate ${count} posts.

STRICT RULES:
- No marketing language
- No hype
- No emojis
- No hashtags
- Must sound like a real developer

Return ONLY JSON:

[
  {
    "tone": "${tone}",
    "content": "post text here"
  }
]
`;
}