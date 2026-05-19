import { supabaseBrowser } from "@/lib/supabase-browser";

export async function deletePost(postId: string) {
  const { error } = await supabaseBrowser
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    console.error(error);
  }
}