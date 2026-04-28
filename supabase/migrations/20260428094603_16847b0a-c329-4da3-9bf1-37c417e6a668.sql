
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  body_html TEXT NOT NULL,
  font_family TEXT,
  text_color TEXT,
  bg_color TEXT,
  card_color TEXT,
  accent_color TEXT,
  show_logo BOOLEAN DEFAULT true,
  show_footer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no public read templates" ON public.email_templates FOR SELECT TO public USING (false);
CREATE INDEX IF NOT EXISTS email_templates_created_at_idx ON public.email_templates (created_at DESC);
