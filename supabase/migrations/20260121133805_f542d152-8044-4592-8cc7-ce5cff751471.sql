-- Create table for wedding website settings
CREATE TABLE public.wedding_websites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    is_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Couple info
    couple_names TEXT,
    couple_description TEXT,
    couple_photo_url TEXT,
    
    -- Wedding details
    wedding_date DATE,
    ceremony_time TEXT,
    ceremony_location TEXT,
    ceremony_address TEXT,
    reception_location TEXT,
    reception_address TEXT,
    
    -- Design settings
    theme TEXT NOT NULL DEFAULT 'classic',
    primary_color TEXT DEFAULT '#D4A574',
    secondary_color TEXT DEFAULT '#8B7355',
    font_family TEXT DEFAULT 'serif',
    
    -- Content sections
    our_story TEXT,
    additional_info TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for wedding photo gallery
CREATE TABLE public.wedding_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES public.wedding_websites(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add access_code column to guests table for unique guest access
ALTER TABLE public.guests 
ADD COLUMN access_code TEXT UNIQUE;

-- Create function to generate unique access codes
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 6-character alphanumeric code
        new_code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.guests WHERE access_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$;

-- Enable RLS on wedding_websites
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;

-- RLS policies for wedding_websites
CREATE POLICY "Users can manage their own website"
ON public.wedding_websites
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Published websites are publicly readable"
ON public.wedding_websites
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can view all websites"
ON public.wedding_websites
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on wedding_photos
ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for wedding_photos
CREATE POLICY "Users can manage their own photos"
ON public.wedding_photos
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.wedding_websites 
        WHERE id = website_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Photos on published websites are publicly readable"
ON public.wedding_photos
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.wedding_websites 
        WHERE id = website_id AND is_published = true
    )
);

-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true);

-- Storage policies for wedding photos
CREATE POLICY "Anyone can view wedding photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Users can upload their own wedding photos"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'wedding-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own wedding photos"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'wedding-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own wedding photos"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'wedding-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add trigger for updated_at on wedding_websites
CREATE TRIGGER update_wedding_websites_updated_at
BEFORE UPDATE ON public.wedding_websites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();