import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "info@helixsolution.au";

const SubmissionSchema = z.object({
  timeSinks: z.array(z.string().max(100)).min(1).max(10),
  businessType: z.string().min(1).max(100),
  currentSoftware: z.array(z.string().max(100)).min(1).max(20),
});

// Escape HTML to prevent injection in email templates
const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const data = SubmissionSchema.parse(body);

    await resend.emails.send({
      from: "Helix Solutions <noreply@helixsolution.au>",
      to: [OWNER_EMAIL],
      subject: "New Lead Submission",
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
          <h1 style="color: hsl(185, 70%, 50%); margin-bottom: 24px;">New Lead</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Time Sinks</td><td style="padding: 8px 0;">${data.timeSinks.map(escapeHtml).join(", ")}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Business Type</td><td style="padding: 8px 0;">${escapeHtml(data.businessType)}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Current Software</td><td style="padding: 8px 0;">${data.currentSoftware.map(escapeHtml).join(", ")}</td></tr>
          </table>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.error("Error processing submission:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ error: "Unable to process your submission. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
