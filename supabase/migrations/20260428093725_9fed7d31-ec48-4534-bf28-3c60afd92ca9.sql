
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL CHECK (direction IN ('sent','received')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  html TEXT,
  text TEXT,
  status TEXT,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only read emails"
ON public.emails FOR SELECT TO public USING (false);

CREATE INDEX IF NOT EXISTS emails_created_at_idx ON public.emails (created_at DESC);
