import { generateContext } from "./openai";
import { buildPostPrompt } from "./build-post-prompt";

type GeneratePostsInput = {
  summary: string;
  stage: string;
  tone: string;
  extraInstructions?: string;
  postCount?: number;
};

export async function generatePosts(
  input: GeneratePostsInput
) {
  const prompt = buildPostPrompt(input);

  const response = await generateContext(
    prompt,
    {
      temperature: 0.7,
      systemPrompt:
        "You write concise developer build-in-public posts.",
    }
  );

  return response;
}