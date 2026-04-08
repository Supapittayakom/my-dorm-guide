
-- Create dorms table
CREATE TABLE public.dorms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_min NUMERIC NOT NULL DEFAULT 0,
  price_max NUMERIC NOT NULL DEFAULT 0,
  room_type TEXT NOT NULL DEFAULT 'single' CHECK (room_type IN ('single', 'shared', 'both')),
  has_air_conditioning BOOLEAN NOT NULL DEFAULT false,
  has_wifi BOOLEAN NOT NULL DEFAULT false,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  has_pet_allowed BOOLEAN NOT NULL DEFAULT false,
  has_furniture BOOLEAN NOT NULL DEFAULT false,
  has_security BOOLEAN NOT NULL DEFAULT false,
  has_cctv BOOLEAN NOT NULL DEFAULT false,
  has_elevator BOOLEAN NOT NULL DEFAULT false,
  has_laundry BOOLEAN NOT NULL DEFAULT false,
  has_kitchen BOOLEAN NOT NULL DEFAULT false,
  total_rooms INTEGER NOT NULL DEFAULT 0,
  available_rooms INTEGER NOT NULL DEFAULT 0,
  address TEXT,
  district TEXT,
  province TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  near_university TEXT,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dorm_images table
CREATE TABLE public.dorm_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dorm_id UUID NOT NULL REFERENCES public.dorms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dorms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dorm_images ENABLE ROW LEVEL SECURITY;

-- Dorms policies
CREATE POLICY "Anyone can view published dorms"
ON public.dorms FOR SELECT
USING (status = 'published');

CREATE POLICY "Owners can view their own dorms"
ON public.dorms FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all dorms"
ON public.dorms FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can create dorms"
ON public.dorms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Owners can update their own dorms"
ON public.dorms FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can delete their own dorms"
ON public.dorms FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Dorm images policies
CREATE POLICY "Anyone can view dorm images"
ON public.dorm_images FOR SELECT
USING (true);

CREATE POLICY "Owners can manage their dorm images"
ON public.dorm_images FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.dorms WHERE id = dorm_id AND owner_id = auth.uid()));

CREATE POLICY "Owners can update their dorm images"
ON public.dorm_images FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.dorms WHERE id = dorm_id AND owner_id = auth.uid()));

CREATE POLICY "Owners can delete their dorm images"
ON public.dorm_images FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.dorms WHERE id = dorm_id AND owner_id = auth.uid()));

-- Admin policies for dorm images
CREATE POLICY "Admins can manage all dorm images"
ON public.dorm_images FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_dorms_owner_id ON public.dorms(owner_id);
CREATE INDEX idx_dorms_status ON public.dorms(status);
CREATE INDEX idx_dorms_price ON public.dorms(price_min, price_max);
CREATE INDEX idx_dorms_near_university ON public.dorms(near_university);
CREATE INDEX idx_dorm_images_dorm_id ON public.dorm_images(dorm_id);

-- Trigger for updated_at
CREATE TRIGGER update_dorms_updated_at
BEFORE UPDATE ON public.dorms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for dorm images
INSERT INTO storage.buckets (id, name, public) VALUES ('dorm-images', 'dorm-images', true);

CREATE POLICY "Anyone can view dorm images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'dorm-images');

CREATE POLICY "Authenticated users can upload dorm images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dorm-images');

CREATE POLICY "Users can update their own dorm images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dorm-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own dorm images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dorm-images' AND auth.uid()::text = (storage.foldername(name))[1]);
