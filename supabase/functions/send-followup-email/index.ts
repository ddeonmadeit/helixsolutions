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

const buildEmail = (name: string, calUrl: string, joinUrl?: string) => {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Meeting — Helix Solutions</title>
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

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-size:13px;color:#6b7a8d;letter-spacing:0.08em;text-transform:uppercase;" class="text-muted">
                      Meeting Reminder
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#e8edf2;line-height:1.25;" class="text-white">
                      Just a reminder, ${firstName} — you have a meeting with us.
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0;font-size:15px;color:#8a9bb0;line-height:1.7;" class="text-muted">
                      This is a friendly reminder that you have a demo call booked with Helix Solutions. You can view your booking details and manage your appointment using the link below.
                    </p>
                  </td>
                </tr>

                ${joinUrl ? `
                <!-- CTA: Join Meeting -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#36b8c8,#2a8fa0);border-radius:12px;padding:0;">
                          <a
                            href="${joinUrl}"
                            style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.01em;"
                            class="text-white"
                          >
                            🎥 Join Meeting Link →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}

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

                <!-- Sign-off -->
                <tr>
                  <td style="padding-bottom:4px;">
                    <p style="margin:0;font-size:14px;color:#8a9bb0;line-height:1.7;" class="text-muted">
                      Need to reschedule or have any questions? Simply reply to this email and we'll sort it out.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;font-size:14px;color:#8a9bb0;" class="text-muted">
                      See you soon,<br/>
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
    const { name, email, joinUrl } = await req.json();
    if (!email) throw new Error("email is required");
    if (!name) throw new Error("name is required");

    const calUrl = "https://cal.com/helix-solutions/demo";

    await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [email.trim()],
      subject: `Reminder: Your meeting with Helix Solutions`,
      html: buildEmail(name.trim(), calUrl, joinUrl || undefined),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
