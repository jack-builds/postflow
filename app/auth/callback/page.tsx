"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // THIS forces Supabase to finalize session from URL code
      await supabaseBrowser.auth.exchangeCodeForSession(window.location.href);

      router.replace("/app");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      Completing login...
    </div>
  );
}