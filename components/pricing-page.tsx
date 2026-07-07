"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

interface Session {
  user: { id: string };
}

export default function PricingPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<"free" | "pro" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Handle checkout
  const handleCheckout = useCallback(async (planId: "free" | "pro") => {
    if (!session) {
      // Redirect to login
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "read:user,user:email,repo",
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return;
    }

    setIsCheckingOut(planId);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process checkout");
      }

      if (planId === "free") {
        // Redirect to dashboard for free plan
        window.location.href = data.redirectUrl;
      } else if (data.checkoutUrl) {
        // Redirect to Stripe checkout for pro plan
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Checkout failed";
      console.error("Checkout error:", err);
      setError(errorMsg);
    } finally {
      setIsCheckingOut(null);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-5 border-b">
        <Link href="/" className="font-semibold tracking-tight">
          Postflow
        </Link>

        <div className="flex gap-6 text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-black transition">
            Dashboard
          </Link>
          <Link href="/new" className="hover:text-black transition">
            Get Started
          </Link>
        </div>
      </header>

      {/* PRICING SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your workflow. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE PLAN */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-sm text-zinc-500">Perfect for getting started</p>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold">$0</div>
              <p className="text-sm text-zinc-500 mt-1">Forever free</p>
            </div>

            <button
              onClick={() => handleCheckout("free")}
              disabled={isCheckingOut === "free"}
              className="w-full rounded-xl border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:opacity-50 mb-8"
            >
              {isCheckingOut === "free" ? "Processing..." : "Get Started"}
            </button>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-green-600 font-bold">✓</div>
                <div className="text-sm">1 post per week</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-600 font-bold">✓</div>
                <div className="text-sm">GitHub integration</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-600 font-bold">✓</div>
                <div className="text-sm">Basic post generation</div>
              </div>
              <div className="flex gap-3">
                <div className="text-gray-400 font-bold">✗</div>
                <div className="text-sm text-gray-500">Priority support</div>
              </div>
              <div className="flex gap-3">
                <div className="text-gray-400 font-bold">✗</div>
                <div className="text-sm text-gray-500">Custom tone profiles</div>
              </div>
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="rounded-2xl border-2 border-black bg-black text-white p-8 dark:border-white dark:bg-zinc-950">
            <div className="mb-6">
              <div className="inline-block bg-white text-black px-3 py-1 rounded-full text-xs font-semibold mb-3">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-sm text-zinc-400">For serious builders</p>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold">$29</div>
              <p className="text-sm text-zinc-400 mt-1">per month, billed monthly</p>
            </div>

            <button
              onClick={() => handleCheckout("pro")}
              disabled={isCheckingOut === "pro"}
              className="w-full rounded-xl bg-white text-black px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 mb-8"
            >
              {isCheckingOut === "pro" ? "Processing..." : "Start Free Trial"}
            </button>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm">Unlimited posts</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm">GitHub integration</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm">Advanced AI generation</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm">Priority support</div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm">Custom tone profiles</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
              <p className="text-gray-600">
                Yes, Pro includes a 14-day free trial. No credit card required to start the trial.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do you offer annual billing?</h3>
              <p className="text-gray-600">
                Contact us at support@postflow.com for annual billing options and enterprise pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 text-center text-xs text-gray-500 space-y-2">
        <div className="flex gap-4 justify-center">
          <Link href="/" className="text-gray-600 hover:text-black transition">
            Home
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-black transition">
            Pricing
          </Link>
          <a href="mailto:support@postflow.com" className="text-gray-600 hover:text-black transition">
            Support
          </a>
        </div>
        <div>Postflow — build → capture → share</div>
        <div className="text-[10px] text-gray-400">
          A workflow tool for developers building in public
        </div>
      </footer>
    </div>
  );
}
