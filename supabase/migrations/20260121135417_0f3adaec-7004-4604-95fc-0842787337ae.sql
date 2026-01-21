-- Allow public read access to guests via access_code when website is published
CREATE POLICY "Public can view guest by access code on published websites"
ON public.guests
FOR SELECT
USING (
  access_code IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.wedding_websites 
    WHERE wedding_websites.user_id = guests.user_id 
    AND wedding_websites.is_published = true
  )
);

-- Allow public update of guest RSVP via access_code when website is published
CREATE POLICY "Public can update guest RSVP by access code on published websites"
ON public.guests
FOR UPDATE
USING (
  access_code IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.wedding_websites 
    WHERE wedding_websites.user_id = guests.user_id 
    AND wedding_websites.is_published = true
  )
)
WITH CHECK (
  access_code IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.wedding_websites 
    WHERE wedding_websites.user_id = guests.user_id 
    AND wedding_websites.is_published = true
  )
);