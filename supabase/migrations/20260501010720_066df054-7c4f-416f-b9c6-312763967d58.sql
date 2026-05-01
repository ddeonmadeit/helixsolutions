CREATE POLICY "Public upload email assets"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'email-assets');

CREATE POLICY "Public update email assets"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'email-assets');