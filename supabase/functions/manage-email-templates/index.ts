import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      const { data, error } = await supabase
        .from("email_templates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return Response.json({ templates: data }, { headers: corsHeaders });
    }
    if (action === "save") {
      const { data, error } = await supabase
        .from("email_templates").insert(body.template).select().single();
      if (error) throw error;
      return Response.json({ template: data }, { headers: corsHeaders });
    }
    if (action === "delete") {
      const { error } = await supabase.from("email_templates").delete().eq("id", body.id);
      if (error) throw error;
      return Response.json({ ok: true }, { headers: corsHeaders });
    }
    throw new Error("Unknown action");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
