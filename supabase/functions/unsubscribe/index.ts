import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const page = (msg: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Unsubscribed</title>
<style>body{margin:0;background:#0b0f1a;color:#e8edf2;font-family:Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#111827;border:1px solid #1e2a3a;border-radius:20px;padding:40px;max-width:420px;text-align:center}
h1{margin:0 0 12px;font-size:22px}p{margin:0;color:#8a9bb0;line-height:1.6}</style></head>
<body><div class="card"><h1>You're unsubscribed</h1><p>${msg}</p></div></body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").toLowerCase().trim();

  // Resend's One-Click POST hits this with no body
  if (email) {
    await supabase.from("unsubscribes").upsert({ email }, { onConflict: "email" });
  }

  if (req.method === "POST") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(page(email ? `${email} will no longer receive emails from us.` : "Request received."), {
    headers: { ...corsHeaders, "Content-Type": "text/html" },
  });
});
