
-- Create a storage bucket for contract PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy so clients can view the contract PDF
CREATE POLICY "Public contract read"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts');

-- Allow service role to upload contracts
CREATE POLICY "Service role upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contracts');
