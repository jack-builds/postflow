import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20",
});

interface CheckoutRequest {
  planId: "free" | "pro";
}

/**
 * Get authenticated user session
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
          error: "Unauthorized: You must be logged in",
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: CheckoutRequest;
    try {
      body = await req.json();
      if (!body.planId || !["free", "pro"].includes(body.planId)) {
        throw new Error("Invalid planId");
      }
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 3. Handle free plan (no Stripe checkout needed)
    if (body.planId === "free") {
      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", userId);

      if (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update subscription",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Free plan activated",
        redirectUrl: "/dashboard",
      });
    }

    // 4. Handle Pro plan (create Stripe checkout session)
    if (body.planId === "pro") {
      // Get or create Stripe customer
      let customerId: string;

      try {
        // Search for existing customer by email
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          // Create new customer
          const customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              userId,
            },
          });
          customerId = customer.id;
        }
      } catch (err) {
        console.error("Stripe customer error:", err);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create checkout session",
          },
          { status: 500 }
        );
      }

      // Create checkout session
      try {
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID_PRO || "",
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          metadata: {
            userId,
          },
        });

        return NextResponse.json({
          success: true,
          checkoutUrl: session.url,
        });
      } catch (err) {
        console.error("Stripe checkout error:", err);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create checkout session",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid plan",
      },
      { status: 400 }
    );
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
