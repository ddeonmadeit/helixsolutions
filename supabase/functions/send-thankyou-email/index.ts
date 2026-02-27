import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SETUP_PRICES: Record<number, { id: string; label: string }> = {
  1: { id: "price_1T4yY76JRSjqUM0WPNm1XOc5", label: "$200" },
  2: { id: "price_1T4ycA6JRSjqUM0WFUu6ovna", label: "$300" },
  3: { id: "price_1T4ycg6JRSjqUM0WYz4vjGsz", label: "$500" },
  4: { id: "price_1T4yed6JRSjqUM0WuWy53Clj", label: "$700" },
  5: { id: "price_1T4yfq6JRSjqUM0WXbbYlqyl", label: "$1000" },
};

const MAINTENANCE_PRICE_ID = "price_1T2oDy6JRSjqUM0WnJdBW2Au";

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

const buildEmail = (name: string, checkoutUrl: string) => {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You — Helix Solutions</title>
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

              <!-- Greeting -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-size:13px;color:#6b7a8d;letter-spacing:0.08em;text-transform:uppercase;" class="text-muted">
                      Helix Solutions
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#e8edf2;line-height:1.25;" class="text-white">
                      Thank you for your interest, ${firstName}.
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0;font-size:15px;color:#8a9bb0;line-height:1.7;" class="text-muted">
                      We're excited to get your custom AI assistant set up. Click the button below to complete your payment and we'll have you running — same day.
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
                            href="${checkoutUrl}"
                            style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.01em;"
                            class="text-white"
                          >
                            Next Step &rarr;
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

                <!-- What happens next -->
                <tr>
                  <td style="padding-bottom:10px;">
                    <p style="margin:0;font-size:13px;font-weight:600;color:#e8edf2;text-transform:uppercase;letter-spacing:0.06em;" class="text-white">
                      What happens next
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1e2a3a;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #1e2a3a;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">01</span>
                            Complete your payment
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #1e2a3a;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">02</span>
                            We build your custom AI assistant
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0;font-size:14px;color:#e8edf2;" class="text-white">
                            <span style="color:#36b8c8;font-weight:700;margin-right:8px;" class="text-teal">03</span>
                            Get set up same day
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
                      If you have any questions, feel free to reply to this email or reach out at
                      <a href="mailto:info@helixsolution.au" style="color:#36b8c8;text-decoration:none;" class="text-teal">info@helixsolution.au</a>.
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
                &copy; 2025 Helix Solutions &middot;
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
    const { name, email, functionCount } = await req.json();
    if (!email || !name) throw new Error("name and email are required");

    const firstName = name.split(" ")[0];
    let checkoutUrl: string;

    if (functionCount === "tier1") {
      // Original tier1 onboarding page
      checkoutUrl = "https://helixsolution.au/tier1";
    } else {
      const count = Math.min(5, Math.max(1, Number(functionCount) || 1));
      const setupPrice = SETUP_PRICES[count];

      // Create a Stripe checkout session for this tier
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      let customerId: string | undefined;
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : email,
        line_items: [
          { price: setupPrice.id, quantity: 1 },
          { price: MAINTENANCE_PRICE_ID, quantity: 1 },
        ],
        mode: "subscription",
        success_url: "https://helixsolutions.lovable.app/?status=success",
        cancel_url: "https://helixsolutions.lovable.app/?status=cancelled",
      });

      checkoutUrl = session.url || "https://helixsolutions.lovable.app";
    }

    await resend.emails.send({
      from: "Helix Solutions <hello@helixsolution.au>",
      to: [email],
      subject: `Thank you, ${firstName} — Complete Your Payment`,
      html: buildEmail(name, checkoutUrl),
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
