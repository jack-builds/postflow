import { supabaseBrowser } from "@/lib/supabase-browser";

export async function updatePostStatus(
  postId: string,
  status: "draft" | "approved" | "queued"
) {
  const { error } = await supabaseBrowser
    .from("posts")
    .update({ status })
    .eq("id", postId);

  if (error) {
    console.error(error);
  }
}