import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export async function updatePostStatus(
  postId: string,
  status: "draft" | "approved" | "queued"
) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("posts")
    .update({ status })
    .eq("id", postId);

  if (error) {
    console.error(error);
  }
}