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
    const hoursSaved = (timeSinks || []).length * 2;

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
          <div style="margin:0;padding:0;background-color:#0b0f1a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:40px 16px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:20px;border:1px solid #1e2a3a;overflow:hidden;box-shadow:0 0 60px rgba(32,178,170,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="padding:36px 40px 28px;border-bottom:1px solid #1e2a3a;">
                      <p style="margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#36b8c8;">HELIX SOLUTIONS</p>
                      <h1 style="margin:10px 0 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26px;font-weight:800;color:#e8edf2;">New Lead Submission</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${[
                          ["Name", name || "—"],
                          ["Email", email || "—"],
                          ["Business Type", businessType || "—"],
                          ["Time Sinks", (timeSinks || []).join(", ") || "—"],
                          ["Current Software", (currentSoftware || []).join(", ") || "—"],
                          ["Hours Saved / week", `${hoursSaved}h`],
                        ].map(([label, value]) => `
                          <tr>
                            <td style="padding:10px 0;font-family:Inter,-apple-system,sans-serif;font-size:13px;color:#6b7a8d;width:160px;vertical-align:top;">${label}</td>
                            <td style="padding:10px 0;font-family:Inter,-apple-system,sans-serif;font-size:14px;color:#e8edf2;font-weight:500;">${value}</td>
                          </tr>
                        `).join("")}
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px 32px;border-top:1px solid #1e2a3a;">
                      <p style="margin:0;font-family:Inter,-apple-system,sans-serif;font-size:12px;color:#3d4d5c;">Helix Solutions · helixsolution.au</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </div>
        `,
      }),
      // Thank-you email to lead
      email ? resend.emails.send({
        from: "Helix Solutions <noreply@helixsolution.au>",
        to: [email],
        subject: `You could save ${hoursSaved} hours a week — Book your free demo`,
        html: `
          <div style="margin:0;padding:0;background-color:#0b0f1a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:40px 16px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:20px;border:1px solid #1e2a3a;overflow:hidden;box-shadow:0 0 80px rgba(32,178,170,0.12),0 0 160px rgba(32,178,170,0.04);">

                  <!-- Header -->
                  <tr>
                    <td style="padding:36px 40px 28px;border-bottom:1px solid #1e2a3a;text-align:center;">
                      <p style="margin:0 0 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#36b8c8;">HELIX SOLUTIONS</p>
                      <h1 style="margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:28px;font-weight:800;color:#e8edf2;line-height:1.3;">Hey ${name ? name.split(" ")[0] : "there"} 👋</h1>
                      <p style="margin:12px 0 0;font-family:Inter,-apple-system,sans-serif;font-size:15px;color:#8a9bb0;line-height:1.6;">Based on your quiz answers, here's what an AI Employee<br>could save your business every single week:</p>
                    </td>
                  </tr>

                  <!-- Hours saved hero -->
                  <tr>
                    <td style="padding:40px 40px 32px;text-align:center;">
                      <div style="background:linear-gradient(135deg,rgba(32,178,170,0.12),rgba(32,178,170,0.04));border:1px solid rgba(32,178,170,0.35);border-radius:16px;padding:36px 24px;box-shadow:0 0 40px rgba(32,178,170,0.15),inset 0 1px 0 rgba(255,255,255,0.04);">
                        <p style="margin:0;font-family:Inter,-apple-system,sans-serif;font-size:80px;font-weight:900;color:#36b8c8;line-height:1;letter-spacing:-3px;">${hoursSaved}</p>
                        <p style="margin:8px 0 0;font-family:Inter,-apple-system,sans-serif;font-size:20px;font-weight:700;color:#e8edf2;letter-spacing:0.5px;">HOURS EVERY WEEK</p>
                        <p style="margin:10px 0 0;font-family:Inter,-apple-system,sans-serif;font-size:13px;color:#6b7a8d;">That's ${hoursSaved * 52}+ hours saved every year</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Body copy -->
                  <tr>
                    <td style="padding:0 40px 36px;text-align:center;">
                      <p style="margin:0 0 8px;font-family:Inter,-apple-system,sans-serif;font-size:16px;color:#8a9bb0;line-height:1.7;">Book your <strong style="color:#e8edf2;">same-day demo</strong> and we'll show you exactly<br>how an AI Employee works for your specific business.</p>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td style="padding:0 40px 48px;text-align:center;">
                      <a href="${calUrl}" style="display:inline-block;background:#36b8c8;color:#0b0f1a;text-decoration:none;padding:20px 48px;border-radius:14px;font-family:Inter,-apple-system,sans-serif;font-size:18px;font-weight:800;letter-spacing:0.3px;box-shadow:0 0 40px rgba(32,178,170,0.4),0 4px 20px rgba(0,0,0,0.3);">
                        Book Your Free Demo →
                      </a>
                      <p style="margin:16px 0 0;font-family:Inter,-apple-system,sans-serif;font-size:12px;color:#3d4d5c;">Same-day availability · No obligation</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid #1e2a3a;text-align:center;">
                      <p style="margin:0 0 4px;font-family:Inter,-apple-system,sans-serif;font-size:12px;color:#3d4d5c;">Questions? Reply to this email and we'll get back to you straight away.</p>
                      <p style="margin:0;font-family:Inter,-apple-system,sans-serif;font-size:12px;color:#2a3a4a;">Helix Solutions · helixsolution.au</p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
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
