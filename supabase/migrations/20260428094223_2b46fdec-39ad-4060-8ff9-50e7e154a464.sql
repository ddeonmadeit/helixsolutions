
CREATE TABLE IF NOT EXISTS public.unsubscribes (
  email TEXT PRIMARY KEY,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unsubscribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no public read unsubscribes" ON public.unsubscribes FOR SELECT TO public USING (false);
