import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "helixsolved@gmail.com";


const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email, businessName, timeSinks, businessType, currentSoftware } = await req.json();

    if (!name || !phone || !businessName) {
      throw new Error("Missing required fields");
    }

    // Send notification to owner
    await resend.emails.send({
      from: "Helix Solutions <noreply@helixsolution.au>",
      to: [OWNER_EMAIL],
      subject: `New Lead: ${name} — ${businessName}`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
          <h1 style="color: hsl(185, 70%, 50%); margin-bottom: 24px;">New Lead</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Email</td><td style="padding: 8px 0;">${email || "Not provided"}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Business</td><td style="padding: 8px 0;">${businessName}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Time Sinks</td><td style="padding: 8px 0;">${(timeSinks || []).join(", ")}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Business Type</td><td style="padding: 8px 0;">${businessType}</td></tr>
            <tr><td style="padding: 8px 0; color: hsl(215, 12%, 55%);">Current Software</td><td style="padding: 8px 0;">${(currentSoftware || []).join(", ")}</td></tr>
          </table>
        </div>
      `,
    });

    // Send thank-you email to user (only if email provided)
    if (email) {
      await resend.emails.send({
        from: "Helix Solutions <hello@helixsolution.au>",
        to: [email],
        cc: ["helixsolved@gmail.com"],
        replyTo: "helixsolved@gmail.com",
        subject: "Thank you — your demo is almost booked!",
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: hsl(225, 30%, 6%); color: hsl(210, 20%, 92%); padding: 40px; border-radius: 16px; border: 1px solid hsl(220, 14%, 20%);">
            <h1 style="color: hsl(185, 70%, 50%); font-size: 28px; margin-bottom: 8px;">Thank you, ${name}!</h1>
            <p style="color: hsl(215, 12%, 55%); font-size: 16px; margin-bottom: 32px;">We've received your details and can't wait to show you what your custom AI employee can do.</p>
            
            <div style="background: linear-gradient(135deg, hsla(185, 70%, 50%, 0.1), hsla(185, 70%, 50%, 0.05)); border: 1px solid hsla(185, 70%, 50%, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="color: hsl(215, 12%, 55%); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Next Step</p>
              <a href="https://cal.com/helix-solutions/demo" style="display: inline-block; background: hsl(185, 70%, 50%); color: hsl(225, 30%, 6%); padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">Book Your Same-Day Demo</a>
            </div>

            <p style="color: hsl(215, 12%, 55%); font-size: 13px; text-align: center; margin-top: 32px;">If you've already booked, we'll see you soon!</p>
          </div>
        `,
      });
    }

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
