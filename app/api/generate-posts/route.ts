import { NextResponse } from "next/server";
import { generatePosts } from "@/lib/generate-posts";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      commits,
      tone,
      count,
      extraInstructions,
      repo,
      userId,
    } = body;

    const commitMessages = commits
      .map((c: any) => c.commit.message)
      .join("\n");

    const posts = await generatePosts({
      repo,
      commitMessages,
      tone,
      count,
      extraInstructions,
    });

    // -----------------------
    // SAVE TO SUPABASE
    // -----------------------
    const rows = posts.map((post: any) => ({
      user_id: userId,
      repo,
      content: post.content || post,
      tone,
      status: "draft",
    }));

    const { error } = await supabaseServer
      .from("posts")
      .insert(rows);

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
    }

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate posts",
      },
      { status: 500 }
    );
  }
}