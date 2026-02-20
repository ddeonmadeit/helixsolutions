import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded price IDs (created in Stripe dashboard)
// $500 AUD one-time deposit
const DEPOSIT_PRICE_ID = "price_deposit_placeholder";
// $100 AUD/month subscription
const SUBSCRIPTION_PRICE_ID = "price_subscription_placeholder";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email: guestEmail } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get authenticated user email
    let userEmail = guestEmail;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user?.email) userEmail = data.user.email;
      } catch (_) {
        // Guest checkout — use provided email
      }
    }

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://helixsolutions.lovable.app";

    if (type === "deposit") {
      // One-time $500 AUD deposit
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [{ price: DEPOSIT_PRICE_ID, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}/tier1?status=deposit_success`,
        cancel_url: `${origin}/tier1?status=cancelled`,
        currency: "aud",
      });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (type === "subscription") {
      // $100 AUD/month subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/tier1?status=subscription_success`,
        cancel_url: `${origin}/tier1?status=cancelled`,
        currency: "aud",
      });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error("Invalid checkout type. Use 'deposit' or 'subscription'.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
