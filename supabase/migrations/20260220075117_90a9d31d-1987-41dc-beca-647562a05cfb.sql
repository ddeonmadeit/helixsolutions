
CREATE TABLE public.signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT true,
  contract_version TEXT NOT NULL DEFAULT 'v1'
);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit their signature)
CREATE POLICY "Anyone can submit a signature"
ON public.signatures
FOR INSERT
WITH CHECK (true);

-- Only service role can read signatures
CREATE POLICY "Service role can read signatures"
ON public.signatures
FOR SELECT
USING (false);
