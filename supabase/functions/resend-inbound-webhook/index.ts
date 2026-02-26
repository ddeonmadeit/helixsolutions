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
    console.log("Inbound webhook payload keys:", JSON.stringify(Object.keys(payload)));

    // Resend inbound webhooks wrap email data inside a "data" object
    const emailData = payload.data || payload;
    console.log("Email data keys:", JSON.stringify(Object.keys(emailData)));

    const from = emailData.from || payload.from || "Unknown sender";
    const subject = emailData.subject || payload.subject || "(no subject)";
    const textBody = emailData.text || payload.text || "";
    const htmlBody = emailData.html || payload.html || "";
    const to = Array.isArray(emailData.to) ? emailData.to.join(", ") : (emailData.to || payload.to || "");

    const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" bgcolor="#0b0f1a">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0f1a" style="background-color:#0b0f1a;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background-color:#111827;border-radius:20px;border:1px solid #1e2a3a;padding:40px;">
        <p style="margin:0 0 4px;font-size:11px;color:#6b7a8d;letter-spacing:2px;text-transform:uppercase;">FORWARDED EMAIL</p>
        <p style="margin:0 0 16px;font-size:13px;color:#8a9bb0;"><strong style="color:#e8edf2;">From:</strong> ${from}<br/><strong style="color:#e8edf2;">To:</strong> ${to}<br/><strong style="color:#e8edf2;">Subject:</strong> ${subject}</p>
        <div style="border-top:1px solid #1e2a3a;padding-top:20px;color:#e8edf2;font-size:14px;line-height:1.7;">
          ${htmlBody || `<pre style="white-space:pre-wrap;color:#e8edf2;margin:0;">${textBody}</pre>`}
        </div>
      </td></tr>
      <tr><td align="center" style="padding-top:24px;">
        <p style="margin:0;font-size:11px;color:#3d4d5c;">© 2025 Helix Solutions · <a href="https://helixsolution.au" style="color:#3d4d5c;text-decoration:none;">helixsolution.au</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

    await resend.emails.send({
      from: "Helix Forwarding <noreply@helixsolution.au>",
      to: ["hitsbydeon@gmail.com"],
      subject: `Fwd: ${subject}`,
      html: wrappedHtml,
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
