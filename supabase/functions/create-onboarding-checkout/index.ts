import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// One-time setup prices keyed by function count (1-5)
const SETUP_PRICES: Record<number, string> = {
  1: "price_1T4yY76JRSjqUM0WPNm1XOc5",  // $200 AUD
  2: "price_1T4ycA6JRSjqUM0WFUu6ovna",  // $300 AUD
  3: "price_1T4ycg6JRSjqUM0WYz4vjGsz",  // $500 AUD
  4: "price_1T4yed6JRSjqUM0WuWy53Clj",  // $700 AUD
  5: "price_1T4yfq6JRSjqUM0WXbbYlqyl",  // $1000 AUD
};

// $100 AUD/month maintenance subscription (same for all tiers)
const MAINTENANCE_PRICE_ID = "price_1T2oDy6JRSjqUM0WnJdBW2Au";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, functionCount } = await req.json();

    const count = Math.min(5, Math.max(1, Number(functionCount) || 1));
    const setupPriceId = SETUP_PRICES[count];

    if (!setupPriceId) {
      throw new Error(`Invalid function count: ${functionCount}`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://helixsolutions.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        { price: setupPriceId, quantity: 1 },
        { price: MAINTENANCE_PRICE_ID, quantity: 1 },
      ],
      mode: "subscription",
      success_url: `${origin}/?status=success`,
      cancel_url: `${origin}/?status=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
