import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "info@helixsolution.au";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeSinks, businessType, currentSoftware } = await req.json();

    await resend.emails.send({
      from: "Helix Solutions <noreply@helixsolution.au>",
      to: [OWNER_EMAIL],
      subject: "New Lead Submission",
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
          <h1 style="color: hsl(185, 70%, 50%); margin-bottom: 24px;">New Lead</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Time Sinks</td><td style="padding: 8px 0;">${(timeSinks || []).join(", ")}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Business Type</td><td style="padding: 8px 0;">${businessType}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Current Software</td><td style="padding: 8px 0;">${(currentSoftware || []).join(", ")}</td></tr>
          </table>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
