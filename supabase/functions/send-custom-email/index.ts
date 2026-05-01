import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL =
  "https://eiqmwhiidovkcihwbmvq.supabase.co/storage/v1/object/public/email-assets/helix-logo.png";
const FROM = "Helix Solutions <hello@helixsolution.au>";
const REPLY_TO = "info@helixsolution.au";
const UNSUB_BASE = `${SUPABASE_URL}/functions/v1/unsubscribe`;

interface Payload {
  to: string;
  subject: string;
  bodyHtml: string;
  fontFamily?: string;
  textColor?: string;
  bgColor?: string;
  cardColor?: string;
  accentColor?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  preview?: boolean;
}

function escapeHtml(s: string): string {
  return (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderEmail(p: Payload, unsubUrl: string): string {
  const font = p.fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const text = p.textColor || "#e8edf2";
  const muted = "#8a9bb0";
  const bg = p.bgColor || "#0b0f1a";
  const card = p.cardColor || "#111827";
  const accent = p.accentColor || "#22d3ee";
  const logo = p.showLogo !== false;
  const footer = p.showFooter !== false;

  // Hidden unsubscribe — same color as background, tiny font, near-zero opacity.
  // Still a real <a> link so spam filters detect a List-Unsubscribe equivalent.
  const hiddenUnsub = `
    <div style="font-size:1px;line-height:1px;color:${bg};opacity:0.01;mso-hide:all;">
      <a href="${unsubUrl}" style="color:${bg};text-decoration:none;font-size:1px;">unsubscribe</a>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="only light" />
<meta name="supported-color-schemes" content="only light" />
<title>${escapeHtml(p.subject)}</title>
<style>
  :root { color-scheme: only light; supported-color-schemes: only light; }
  /* Outlook.com dark mode override */
  [data-ogsc] body, [data-ogsc] .force-bg { background-color: ${bg} !important; }
  [data-ogsc] .force-card { background-color: ${card} !important; }
  [data-ogsc] .force-text, [data-ogsc] .force-text * { color: ${text} !important; }
  [data-ogsc] .force-muted { color: ${muted} !important; }
  [data-ogsc] .force-accent { color: ${accent} !important; }
  /* Apple Mail / iOS / Gmail dark mode override */
  @media (prefers-color-scheme: dark) {
    body, .force-bg { background-color: ${bg} !important; }
    .force-card { background-color: ${card} !important; }
    .force-text, .force-text * { color: ${text} !important; }
    .force-muted { color: ${muted} !important; }
    .force-accent { color: ${accent} !important; }
  }
  /* Disable iOS auto-detection link recoloring */
  u + .body a, #MessageViewBody a { color: inherit !important; text-decoration: none !important; }
</style>
</head>
<body class="body force-bg" style="margin:0;padding:0;background-color:${bg} !important;font-family:${font};color:${text};" bgcolor="${bg}">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${bg};opacity:0;">
  ${escapeHtml(p.subject)} — Helix Solutions
</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" class="force-bg" role="presentation" style="background-color:${bg} !important;">
  <tr><td align="center" bgcolor="${bg}" style="padding:40px 16px;background-color:${bg} !important;">
    <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0" role="presentation">
      ${logo ? `<tr><td align="center" style="padding-bottom:24px;">
        <img src="${LOGO_URL}" alt="Helix Solutions" width="64" height="64" style="display:block;border:0;border-radius:14px;" />
      </td></tr>` : ""}
      <tr><td class="force-card force-text" bgcolor="${card}" style="background-color:${card} !important;border-radius:20px;border:1px solid #1e2a3a;padding:40px;color:${text} !important;font-size:15px;line-height:1.7;">
        <div class="force-text" style="color:${text} !important;">${p.bodyHtml}</div>
        <p class="force-muted" style="margin:32px 0 0;font-size:14px;color:${muted} !important;line-height:1.7;">
          Kind Regards,<br/>
          <span class="force-text" style="color:${text} !important;font-weight:600;">Helix Team</span>
        </p>
      </td></tr>
      ${footer ? `<tr><td align="center" style="padding-top:24px;">
        <p style="margin:0;font-size:11px;color:#3d4d5c;">
          © 2025 Helix Solutions · <a class="force-accent" href="https://helixsolution.au" style="color:${accent} !important;text-decoration:none;">helixsolution.au</a>
        </p>
      </td></tr>` : ""}
      <tr><td>${hiddenUnsub}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    const recipient = payload.to.trim().toLowerCase();
    const unsubUrl = `${UNSUB_BASE}?e=${encodeURIComponent(recipient)}`;
    const html = renderEmail(payload, unsubUrl);

    if (payload.preview) {
      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Suppression list check
    const { data: sup } = await supabase
      .from("unsubscribes").select("email").eq("email", recipient).maybeSingle();
    if (sup) {
      await supabase.from("emails").insert({
        direction: "sent", from_email: "hello@helixsolution.au",
        to_email: recipient, subject: payload.subject, html,
        status: "suppressed", resend_id: null,
      });
      return new Response(JSON.stringify({ success: false, suppressed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = htmlToText(payload.bodyHtml);

    const result = await resend.emails.send({
      from: FROM,
      to: [recipient],
      reply_to: REPLY_TO,
      subject: payload.subject,
      html,
      text, // plain-text alternative — major spam-score reducer
      headers: {
        // RFC 8058 one-click unsubscribe — Gmail/Yahoo bulk-sender requirement
        "List-Unsubscribe": `<${unsubUrl}>, <mailto:unsubscribe@helixsolution.au?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "Precedence": "bulk",
      },
    });

    await supabase.from("emails").insert({
      direction: "sent", from_email: "hello@helixsolution.au",
      to_email: recipient, subject: payload.subject, html,
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
