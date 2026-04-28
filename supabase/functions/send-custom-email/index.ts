import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL =
  "https://eiqmwhiidovkcihwbmvq.supabase.co/storage/v1/object/public/email-assets/helix-logo.png";

interface Payload {
  to: string;
  subject: string;
  bodyHtml: string; // raw inner HTML the user composed
  fontFamily?: string;
  textColor?: string;
  bgColor?: string;
  cardColor?: string;
  accentColor?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  preview?: boolean; // if true, just return rendered HTML without sending
}

export function renderEmail(p: Payload): string {
  const font =
    p.fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const text = p.textColor || "#e8edf2";
  const muted = "#8a9bb0";
  const bg = p.bgColor || "#0b0f1a";
  const card = p.cardColor || "#111827";
  const accent = p.accentColor || "#22d3ee";
  const logo = p.showLogo !== false;
  const footer = p.showFooter !== false;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(p.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${bg};font-family:${font};" bgcolor="${bg}">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0">
      ${
        logo
          ? `<tr><td align="center" style="padding-bottom:24px;">
            <img src="${LOGO_URL}" alt="Helix Solutions" width="64" height="64" style="display:block;border:0;border-radius:14px;" />
          </td></tr>`
          : ""
      }
      <tr><td style="background-color:${card};border-radius:20px;border:1px solid #1e2a3a;padding:40px;color:${text};font-size:15px;line-height:1.7;">
        <div style="color:${text};">${p.bodyHtml}</div>
        <p style="margin:32px 0 0;font-size:14px;color:${muted};line-height:1.7;">
          Kind Regards,<br/>
          <span style="color:${text};font-weight:600;">Helix Team</span>
        </p>
      </td></tr>
      ${
        footer
          ? `<tr><td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#3d4d5c;">
                © 2025 Helix Solutions · <a href="https://helixsolution.au" style="color:${accent};text-decoration:none;">helixsolution.au</a>
              </p>
            </td></tr>`
          : ""
      }
    </table>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    const html = renderEmail(payload);

    if (payload.preview) {
      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [payload.to],
      subject: payload.subject,
      html,
    });

    await supabase.from("emails").insert({
      direction: "sent",
      from_email: "hello@helixsolution.au",
      to_email: payload.to,
      subject: payload.subject,
      html,
      status: result.error ? "failed" : "sent",
      resend_id: result.data?.id ?? null,
    });

    if (result.error) throw new Error(result.error.message);

    return new Response(JSON.stringify({ success: true, html, id: result.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
