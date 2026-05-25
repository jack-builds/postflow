import OpenAI from "openai";



export async function POST(req: Request) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return Response.json(
      { error: "OpenAI API key is not set." },
      { status: 500 }
    );
  }
  const client = new OpenAI({ apiKey: openaiApiKey });
  const { prompt } = await req.json();

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return Response.json({
    result: res.choices[0].message.content,
  });
}