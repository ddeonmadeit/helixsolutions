import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const from = payload.from || "Unknown sender";
    const subject = payload.subject || "(no subject)";
    const textBody = payload.text || "";
    const htmlBody = payload.html || "";
    const to = payload.to || "";

    await resend.emails.send({
      from: "Helix Forwarding <noreply@helixsolution.au>",
      to: ["hitsbydeon@gmail.com"],
      subject: `Fwd: ${subject}`,
      html: htmlBody || `<pre>${textBody}</pre>`,
      headers: {
        "X-Original-From": from,
        "X-Original-To": to,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Inbound webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
