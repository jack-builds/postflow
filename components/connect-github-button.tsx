"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function ConnectGitHubButton() {
  async function handleLogin() {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/app",
      },
    });
  }

  return (
    <Button onClick={handleLogin}>
      Connect GitHub
    </Button>
  );
}