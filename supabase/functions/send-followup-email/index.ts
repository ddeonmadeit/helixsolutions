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

const forcedDarkStyles = `
  :root { color-scheme: dark !important; }
  @media (prefers-color-scheme: light) {
    body, .email-bg { background-color: #0b0f1a !important; color: #e8edf2 !important; }
    .card { background-color: #111827 !important; }
    .text-muted { color: #6b7a8d !important; }
    .text-white { color: #e8edf2 !important; }
    .text-teal { color: #36b8c8 !important; }
  }
  [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b0f1a !important; }
  [data-ogsc] .card { background-color: #111827 !important; }
  [data-ogsc] .text-muted { color: #6b7a8d !important; }
  [data-ogsc] .text-white { color: #e8edf2 !important; }
  [data-ogsc] .text-teal { color: #36b8c8 !important; }
`;

const buildEmail = (name: string, calUrl: string) => {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Demo Booking — Helix Solutions</title>
  <style>${forcedDarkStyles}</style>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" bgcolor="#0b0f1a" class="email-bg">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0f1a" class="email-bg">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#111827;border-radius:20px;border:1px solid #1e2a3a;padding:40px 40px 32px;" class="card">

              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <img
                      src="https://eiqmwhiidovkcihwbmvq.supabase.co/storage/v1/object/public/email-assets/helix-logo.png"
                      alt="Helix Solutions"
                      width="80"
                      style="display:block;border-radius:12px;"
                    />
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-size:13px;color:#6b7a8d;letter-spacing:0.08em;text-transform:uppercase;" class="text-muted">
                      Friendly reminder
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#e8edf2;line-height:1.25;" class="text-white">
                      Hey ${firstName}, don't forget to book your demo.
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0;font-size:15px;color:#8a9bb0;line-height:1.7;" class="text-muted">
                      We had a great chat and we'd love to show you exactly how Helix Solutions can save your business hours every week. Your personalised demo slot is just one click away.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#36b8c8,#2a8fa0);border-radius:12px;padding:0;">
                          <a
                            href="${calUrl}"
                            style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.01em;"
                            class="text-white"
                          >
                            Book Your Free Demo →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px;background-color:#1e2a3a;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- What to expect -->
                <tr>
                  <td style="padding-bottom:10px;">
                    <p style="margin:0;font-size:13px;font-weight:600;color:#e8edf2;text-transform:uppercase;letter-spacing:0.06em;" class="text-white">
                      What we'll cover in your demo
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1e2a3a;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #1e2a3a;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">✦</span>
                            A walkthrough of your custom AI automation plan
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #1e2a3a;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">✦</span>
                            Live demo of real time savings in your workflow
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">✦</span>
                            Q&amp;A — ask us anything, zero pressure
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Sign-off -->
                <tr>
                  <td style="padding-bottom:4px;">
                    <p style="margin:0;font-size:14px;color:#8a9bb0;line-height:1.7;" class="text-muted">
                      If now isn't the right time, no worries at all — just reply to this email and we'll find a time that suits you.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;font-size:14px;color:#8a9bb0;" class="text-muted">
                      Warm regards,<br/>
                      <span style="color:#e8edf2;font-weight:600;" class="text-white">The Helix Solutions Team</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#3d4d5c;">
                © 2025 Helix Solutions ·
                <a href="https://helixsolution.au" style="color:#3d4d5c;text-decoration:none;">helixsolution.au</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) throw new Error("email is required");

    // Look up lead by email to get their name and quiz data
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("name, email, time_sinks, business_type, current_software")
      .eq("email", email.trim().toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1);

    const lead = leads?.[0];
    const name = lead?.name || email.split("@")[0];

    // Build personalised Cal URL with their quiz metadata if available
    const calUrl = lead
      ? `https://cal.com/helix-solutions/demo?metadata[timeSinks]=${encodeURIComponent((lead.time_sinks || []).join(", "))}&metadata[businessType]=${encodeURIComponent(lead.business_type || "")}&metadata[currentSoftware]=${encodeURIComponent((lead.current_software || []).join(", "))}`
      : "https://cal.com/helix-solutions/demo";

    await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [email.trim()],
      subject: `Hey ${name.split(" ")[0]}, your free demo is one click away`,
      html: buildEmail(name, calUrl),
    });

    return new Response(JSON.stringify({ success: true, name, calUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
