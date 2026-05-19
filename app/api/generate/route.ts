import { NextResponse } from "next/server";

import { generatePosts } from "@/lib/generate-posts";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      summary,
      stage,
      tone,
      extraInstructions,
      postCount,
    } = body;

    const result = await generatePosts({
      summary,
      stage,
      tone,
      extraInstructions,
      postCount,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}