import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to, subject, name, body } = await req.json();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" bgcolor="#0b0f1a">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0f1a">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#111827;border-radius:20px;border:1px solid #1e2a3a;padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#e8edf2;">
                Thank you for your time, ${name}.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#8a9bb0;line-height:1.7;">
                ${body}
              </p>
              <p style="margin:0;font-size:14px;color:#8a9bb0;line-height:1.7;">
                Kind Regards,<br/>
                <span style="color:#e8edf2;font-weight:600;">Deon & Juna</span>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#3d4d5c;">
                © 2025 Helix Solutions · <a href="https://helixsolution.au" style="color:#3d4d5c;text-decoration:none;">helixsolution.au</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [to],
      subject,
      html,
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
