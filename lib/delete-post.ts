import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export async function deletePost(postId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    console.error(error);
  }
}