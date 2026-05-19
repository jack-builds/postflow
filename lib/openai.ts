type GenerateContextOptions = {
  temperature?: number;
  systemPrompt?: string;
};

export async function generateContext(
  prompt: string,
  options?: GenerateContextOptions
) {
  try {
    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",

          messages: [
            {
              role: "system",
              content:
                options?.systemPrompt ||
                "You are a concise developer writing assistant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: options?.temperature ?? 0.3,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`OpenAI error: ${res.status}`);
    }

    const data = await res.json();

    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("generateContext failed:", error);

    return "";
  }
}