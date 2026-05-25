import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Validate and get the authenticated user's session
 */
async function getAuthenticatedUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          cookieStore.set(name, value);
        });
      },
    },
  });

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Unauthorized: No valid session");
  }

  return session;
}

/**
 * Validate request body
 */
function validateRequestBody(body: unknown): { text: string } {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { text } = body as Record<string, unknown>;

  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("text must be a non-empty string");
  }

  if (text.length > 5000) {
    throw new Error("text must be less than 5000 characters");
  }

  return { text: text.trim() };
}

/**
 * Structure input using OpenAI
 */
async function structureWithAI(text: string) {
  const prompt = `
You are a context engine for a developer workflow tool.

Convert this dev update into JSON ONLY (no markdown, no extra text):

{
  "summary": "...",
  "category": "feature | bugfix | learning | milestone",
  "stage": "early | building | shipped | iteration",
  "tone": "technical | casual | hype"
}

Dev update:
${text}
`;

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("Missing OpenAI API key");
  }

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!aiRes.ok) {
    const errorData = await aiRes.json();
    console.error("OpenAI API Error:", errorData);
    throw new Error("Failed to structure content with AI");
  }

  const data = await aiRes.json();

  let structured;
  try {
    const content = data.choices?.[0]?.message?.content || "{}";
    structured = JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    // Fallback structure if AI parsing fails
    structured = {
      summary: text.substring(0, 200),
      category: "unknown",
      stage: "building",
      tone: "casual",
    };
  }

  // Validate structured data
  if (typeof structured.summary !== "string") {
    structured.summary = text.substring(0, 200);
  }
  if (!["feature", "bugfix", "learning", "milestone"].includes(structured.category)) {
    structured.category = "unknown";
  }
  if (!["early", "building", "shipped", "iteration"].includes(structured.stage)) {
    structured.stage = "building";
  }
  if (!["technical", "casual", "hype"].includes(structured.tone)) {
    structured.tone = "casual";
  }

  return structured;
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    let session;
    try {
      session = await getAuthenticatedUser();
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You must be logged in to capture content",
        },
        { status: 401 }
      );
    }

    // 2. Validate request body
    let requestBody: { text: string };
    try {
      const body = await req.json();
      requestBody = validateRequestBody(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid request";
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }

    const { text } = requestBody;
    const userId = session.user.id;

    // 3. Structure the input using AI
    let structured;
    try {
      structured = await structureWithAI(text);
    } catch (error) {
      console.error("AI Structuring Error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to structure content. Please try again.",
        },
        { status: 500 }
      );
    }

    // 4. Save to Supabase
    const supabase = getSupabaseServerClient();
    const { data: saved, error: insertError } = await supabase
      .from("captures")
      .insert({
        user_id: userId,
        raw_text: text,
        summary: structured.summary,
        category: structured.category,
        stage: structured.stage,
        tone: structured.tone,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save capture to database",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
