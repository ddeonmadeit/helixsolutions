
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  time_sinks TEXT[],
  business_type TEXT,
  current_software TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public quiz form)
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Only service role can read (edge function uses service role)
CREATE POLICY "Service role can read leads"
ON public.leads
FOR SELECT
USING (false);
