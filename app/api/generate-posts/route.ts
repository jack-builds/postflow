import { NextResponse } from "next/server";
import { generatePosts } from "@/lib/generate-posts";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

interface GeneratePostsRequestBody {
  commits: Commit[];
  tone: string;
  count: number;
  extraInstructions: string;
  repo: string;
}

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
function validateRequestBody(body: unknown): GeneratePostsRequestBody {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { commits, tone, count, extraInstructions, repo } = body as Record<string, unknown>;

  if (!Array.isArray(commits) || commits.length === 0) {
    throw new Error("commits must be a non-empty array");
  }

  if (typeof tone !== "string" || !["dev", "casual", "technical"].includes(tone)) {
    throw new Error("tone must be one of: dev, casual, technical");
  }

  if (typeof count !== "number" || count < 1 || count > 5) {
    throw new Error("count must be a number between 1 and 5");
  }

  if (typeof extraInstructions !== "string") {
    throw new Error("extraInstructions must be a string");
  }

  if (typeof repo !== "string" || repo.length === 0) {
    throw new Error("repo must be a non-empty string");
  }

  return {
    commits,
    tone,
    count,
    extraInstructions,
    repo,
  };
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
          error: "Unauthorized: You must be logged in to generate posts",
        },
        { status: 401 }
      );
    }

    // 2. Validate request body
    let requestBody: GeneratePostsRequestBody;
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

    const { commits, tone, count, extraInstructions, repo } = requestBody;
    const userId = session.user.id;

    // 3. Generate posts using AI
    const commitMessages = commits
      .map((c: Commit) => c.commit.message)
      .join("\n");

    let posts;
    try {
      posts = await generatePosts({
        repo,
        commitMessages,
        tone,
        count,
        extraInstructions,
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate posts. Please try again.",
        },
        { status: 500 }
      );
    }

    // 4. Save to Supabase
    const rows = posts.map((post: { content: string }) => ({
      user_id: userId,
      repo,
      content: post.content || post,
      tone,
      status: "draft",
    }));

    const supabase = getSupabaseServerClient();
    const { error: insertError } = await supabase
      .from("posts")
      .insert(rows);

    if (insertError) {
      console.error("SUPABASE INSERT ERROR:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save posts to database",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
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
