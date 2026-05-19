import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateContext } from "@/lib/openai";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json(
      { error: "No input provided" },
      { status: 400 }
    );
  }

  // 1. STRUCTURE THE INPUT (AI CONTEXT LAYER)
  const prompt = `
You are a context engine for a developer workflow tool.

Convert this dev update into JSON ONLY:

{
  "summary": "...",
  "category": "feature | bugfix | learning | milestone",
  "stage": "early | building | shipped | iteration",
  "tone": "technical | casual | hype"
}

Dev update:
${text}
`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await aiRes.json();

  let structured;

  try {
    structured = JSON.parse(
      data.choices?.[0]?.message?.content || "{}"
    );
  } catch {
    structured = {
      summary: text,
      category: "unknown",
      stage: "building",
      tone: "casual",
    };
  }

  // 2. SAVE TO SUPABASE (THIS IS THE BIG MOMENT)
  const { data: saved, error } = await supabase
    .from("captures")
    .insert({
      raw_text: text,
      summary: structured.summary,
      category: structured.category,
      stage: structured.stage,
      tone: structured.tone,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // 3. RETURN STORED RECORD
  return NextResponse.json(saved);
}
