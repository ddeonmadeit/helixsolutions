ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS personality text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS openclaw_prompt text;