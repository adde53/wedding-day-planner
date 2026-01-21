-- Create a table for storing seating arrangements
CREATE TABLE public.seating_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 8,
  shape TEXT NOT NULL DEFAULT 'round',
  position_x DOUBLE PRECISION NOT NULL DEFAULT 200,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 200,
  rotation DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for storing chair assignments
CREATE TABLE public.seating_chairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  chair_index INTEGER NOT NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(table_id, chair_index)
);

-- Enable Row Level Security
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_chairs ENABLE ROW LEVEL SECURITY;

-- Create policies for seating_tables
CREATE POLICY "Users can view their own tables" 
ON public.seating_tables 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tables" 
ON public.seating_tables 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tables" 
ON public.seating_tables 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tables" 
ON public.seating_tables 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for seating_chairs (via table ownership)
CREATE POLICY "Users can view chairs of their tables" 
ON public.seating_chairs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.seating_tables 
  WHERE seating_tables.id = seating_chairs.table_id 
  AND seating_tables.user_id = auth.uid()
));

CREATE POLICY "Users can create chairs for their tables" 
ON public.seating_chairs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seating_tables 
  WHERE seating_tables.id = seating_chairs.table_id 
  AND seating_tables.user_id = auth.uid()
));

CREATE POLICY "Users can update chairs of their tables" 
ON public.seating_chairs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.seating_tables 
  WHERE seating_tables.id = seating_chairs.table_id 
  AND seating_tables.user_id = auth.uid()
));

CREATE POLICY "Users can delete chairs of their tables" 
ON public.seating_chairs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.seating_tables 
  WHERE seating_tables.id = seating_chairs.table_id 
  AND seating_tables.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_seating_tables_updated_at
BEFORE UPDATE ON public.seating_tables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seating_chairs_updated_at
BEFORE UPDATE ON public.seating_chairs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();