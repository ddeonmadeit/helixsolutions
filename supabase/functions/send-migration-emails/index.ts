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

// Shared forced-dark CSS — overrides iOS Mail light mode, Gmail, Outlook dark mode
const forcedDarkStyles = `
  /* Force dark regardless of system colour scheme */
  :root { color-scheme: dark !important; }

  /* iOS Mail / Apple Mail light-mode override */
  @media (prefers-color-scheme: light) {
    body, .email-bg { background-color: #0b0f1a !important; color: #e8edf2 !important; }
    .card { background-color: #111827 !important; }
    .card-inner { background-color: #111827 !important; }
    .accent-box { background-color: #0d1f24 !important; }
    .text-muted { color: #6b7a8d !important; }
    .text-sub { color: #8a9bb0 !important; }
    .text-white { color: #e8edf2 !important; }
    .text-teal { color: #36b8c8 !important; }
    .text-dim { color: #3d4d5c !important; }
    .text-dimmer { color: #2a3a4a !important; }
    .border-dark { border-color: #1e2a3a !important; }
  }

  /* Outlook dark-mode overrides (data-ogsc) */
  [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b0f1a !important; }
  [data-ogsc] .card { background-color: #111827 !important; }
  [data-ogsc] .card-inner { background-color: #111827 !important; }
  [data-ogsc] .accent-box { background-color: #0d1f24 !important; }
  [data-ogsc] .text-muted { color: #6b7a8d !important; }
  [data-ogsc] .text-sub { color: #8a9bb0 !important; }
  [data-ogsc] .text-white { color: #e8edf2 !important; }
  [data-ogsc] .text-teal { color: #36b8c8 !important; }
  [data-ogsc] .text-dim { color: #3d4d5c !important; }
  [data-ogsc] .text-dimmer { color: #2a3a4a !important; }
  [data-ogsc] .btn-teal { background-color: #36b8c8 !important; }
  [data-ogsc] .btn-teal a { color: #0b0f1a !important; background-color: #36b8c8 !important; }

  /* Base resets */
  body { margin: 0; padding: 0; background-color: #0b0f1a !important; -webkit-text-size-adjust: 100%; }
  * { box-sizing: border-box; }
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeSinks, businessType, currentSoftware, timeSinksOther, businessTypeOther } = await req.json();

    // ─── Owner notification email ───────────────────────────────────────────
    const ownerHtml = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<meta name="x-apple-disable-message-reformatting">
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>${forcedDarkStyles}</style>
</head>
<body bgcolor="#0b0f1a" class="email-bg" style="margin:0;padding:0;background-color:#0b0f1a !important;">
<table class="email-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0f1a" style="background-color:#0b0f1a !important;padding:40px 16px;">
  <tr>
    <td align="center" bgcolor="#0b0f1a" class="email-bg" style="background-color:#0b0f1a !important;">
      <table class="card" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#111827 !important;border-radius:20px;border:1px solid #1e2a3a;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td align="center" bgcolor="#111827" class="card-inner" style="background-color:#111827 !important;padding:36px 40px 28px;border-bottom:2px solid #1e2a3a;">
            <img src="https://helixsolutions.lovable.app/favicon.jpeg" alt="Helix Solutions" width="48" height="48" style="display:block;margin:0 auto 16px;border-radius:12px;" />
            <p class="text-teal" style="margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#36b8c8 !important;">HELIX SOLUTIONS</p>
            <h1 class="text-white" style="margin:10px 0 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26px;font-weight:800;color:#e8edf2 !important;">New Quiz Submission</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td bgcolor="#111827" class="card-inner" style="background-color:#111827 !important;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${[
                ["Business Type", businessType === "other" ? (businessTypeOther || "Other") : (businessType || "—")],
                ["Time Sinks", (timeSinks || []).map((s: string) => s === "other" ? (timeSinksOther || "Other") : s).join(", ") || "—"],
                ["Current Software", (currentSoftware || []).join(", ") || "—"],
              ].map(([label, value]) => `
              <tr>
                <td bgcolor="#111827" class="card-inner text-muted" style="background-color:#111827 !important;padding:10px 0;font-family:Inter,-apple-system,sans-serif;font-size:13px;color:#6b7a8d !important;width:160px;vertical-align:top;">${label}</td>
                <td bgcolor="#111827" class="card-inner text-white" style="background-color:#111827 !important;padding:10px 0;font-family:Inter,-apple-system,sans-serif;font-size:14px;color:#e8edf2 !important;font-weight:500;">${value}</td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td bgcolor="#111827" class="card-inner" style="background-color:#111827 !important;padding:20px 40px 32px;border-top:1px solid #1e2a3a;">
            <p class="text-dim" style="margin:0;font-family:Inter,-apple-system,sans-serif;font-size:12px;color:#3d4d5c !important;">Helix Solutions · helixsolution.au</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    await Promise.all([
      supabaseAdmin.from("leads").insert({
        time_sinks: timeSinks || [],
        business_type: businessType || null,
        current_software: currentSoftware || [],
      }),
      resend.emails.send({
        from: "Helix Solutions <noreply@helixsolution.au>",
        to: [OWNER_EMAIL, "hitsbydeon@gmail.com"],
        subject: "New Quiz Submission",
        html: ownerHtml,
      }),
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
