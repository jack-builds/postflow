type PromptOptions = {
  summary: string;
  stage: string;
  tone: string;
  extraInstructions?: string;
  postCount?: number;
};

export function buildPostPrompt({
  summary,
  stage,
  tone,
  extraInstructions,
  postCount = 3,
}: PromptOptions) {
  return `
You are helping a software developer write authentic build-in-public posts.

STRICT RULES:
- No cringe marketing language
- No corporate tone
- No hype-thread energy
- Minimal emojis
- Sound like a real developer
- Keep posts concise
- Use developer-native wording
- Avoid sounding AI-generated
- Focus on actual engineering progress
- Natural tone only

Development Stage:
${stage}

Selected Development Context:
${summary}

Tone:
${tone}

Extra Instructions:
${extraInstructions || "None"}

Generate ${postCount} unique posts.

Each post should:
- feel authentic
- sound technical but readable
- avoid hashtags
- avoid clickbait
- avoid startup clichés
- be clean and minimal
`;
}