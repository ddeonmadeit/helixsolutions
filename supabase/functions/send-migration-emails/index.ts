import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "helixsolved@gmail.com";

const costRangeMax: Record<string, number> = {
  "0-50": 50,
  "50-100": 100,
  "100-200": 200,
  "200-400": 400,
  "400+": 500,
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, websiteUrl, websiteType, currentPlatform, monthlyCost } = await req.json();

    if (!name || !email || !websiteUrl) {
      throw new Error("Missing required fields");
    }

    const maxCost = costRangeMax[monthlyCost] ?? 100;
    const savings = (maxCost - 1.73).toFixed(2);
    const newCost = "4.16";
    const oneTimeSetupFee = "included";

    // Send notification to owner
    await resend.emails.send({
      from: "Migration Tool <noreply@helixsolution.au>",
      to: [OWNER_EMAIL],
      subject: `New Migration Lead: ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 40px; border-radius: 16px;">
          <h1 style="color: #00d4aa; margin-bottom: 24px;">New Migration Request</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Website</td><td style="padding: 8px 0;">${websiteUrl}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Type</td><td style="padding: 8px 0;">${websiteType}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Platform</td><td style="padding: 8px 0;">${currentPlatform}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Monthly Cost</td><td style="padding: 8px 0;">$${monthlyCost}/mo</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Est. Savings</td><td style="padding: 8px 0; color: #00d4aa; font-weight: bold;">$${savings}/mo</td></tr>
          </table>
        </div>
      `,
    });

    // Send thank-you email to user
    await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [email],
      cc: ["helixsolved@gmail.com"],
      replyTo: "helixsolved@gmail.com",
      subject: "Thank you — we have all the info we need!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 40px; border-radius: 16px;">
          <h1 style="color: #00d4aa; font-size: 28px; margin-bottom: 8px;">Thank you, ${name}!</h1>
          <p style="color: #aaa; font-size: 16px; margin-bottom: 32px;">We have all the info we need to get started on your migration.</p>
          
          <div style="background: linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,180,220,0.1)); border: 1px solid rgba(0,212,170,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Estimated Monthly Savings</p>
            <p style="color: #00d4aa; font-size: 42px; font-weight: 800; margin: 0;">$${savings}<span style="font-size: 16px; color: #888;">/mo</span></p>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your New Monthly Cost</p>
            <p style="color: #fff; font-size: 36px; font-weight: 700; margin: 0;">$${newCost}<span style="font-size: 16px; color: #888;">/mo</span></p>
            <p style="color: #888; font-size: 13px; margin: 8px 0 0 0;">Including a one-time setup fee</p>
          </div>

          <p style="color: #666; font-size: 13px; text-align: center; margin-top: 32px;">Our team will reach out within 24 hours with your custom migration plan.</p>
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
