import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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
    const { timeSinks, businessType, currentSoftware, name, email } = await req.json();

    const calUrl = `https://cal.com/helix-solutions/demo?metadata[timeSinks]=${encodeURIComponent((timeSinks || []).join(", "))}&metadata[businessType]=${encodeURIComponent(businessType || "")}&metadata[currentSoftware]=${encodeURIComponent((currentSoftware || []).join(", "))}`;

    await Promise.all([
      // Save lead to database
      supabaseAdmin.from("leads").insert({
        name: name || null,
        email: email || null,
        time_sinks: timeSinks || [],
        business_type: businessType || null,
        current_software: currentSoftware || [],
      }),
      // Notify owner
      resend.emails.send({
        from: "Helix Solutions <noreply@helixsolution.au>",
        to: [OWNER_EMAIL, "hitsbydeon@gmail.com"],
        subject: "New Lead Submission",
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
            <h1 style="color: hsl(185, 70%, 50%); margin-bottom: 24px;">New Lead</h1>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Name</td><td style="padding: 8px 0;">${name || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Email</td><td style="padding: 8px 0;">${email || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Time Sinks</td><td style="padding: 8px 0;">${(timeSinks || []).join(", ")}</td></tr>
              <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Business Type</td><td style="padding: 8px 0;">${businessType}</td></tr>
              <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Current Software</td><td style="padding: 8px 0;">${(currentSoftware || []).join(", ")}</td></tr>
            </table>
          </div>
        `,
      }),
      // Thank-you email to lead
      email ? resend.emails.send({
        from: "Helix Solutions <noreply@helixsolution.au>",
        to: [email],
        subject: "Your AI Employee Results + Book Your Demo",
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
            <h1 style="color: hsl(185, 70%, 50%); margin-bottom: 8px;">Hey ${name ? name.split(" ")[0] : "there"} 👋</h1>
            <p style="color: hsl(210, 20%, 75%); margin-bottom: 24px;">Thanks for completing the quiz! Based on your answers, an AI Employee could save your business <strong style="color: hsl(210, 20%, 92%);">4+ hours every single day</strong>.</p>
            <p style="color: hsl(210, 20%, 75%); margin-bottom: 32px;">The next step is to book your same-day demo so we can show you exactly how it works for your business.</p>
            <a href="${calUrl}" style="display: inline-block; background: hsl(185, 70%, 50%); color: hsl(225, 30%, 6%); text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px;">Book Your Free Demo →</a>
            <p style="color: hsl(215, 12%, 45%); margin-top: 32px; font-size: 13px;">Questions? Reply to this email and we'll get back to you right away.</p>
          </div>
        `,
      }) : Promise.resolve(),
    ]);

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
