
-- Drop the overly permissive insert policy and replace with a more restricted one
DROP POLICY IF EXISTS "Service role upload contracts" ON storage.objects;

-- Only allow inserts where the bucket is contracts AND the uploader is authenticated
-- (In practice, uploads happen via server-side tools with the service role key)
CREATE POLICY "Authenticated upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');
