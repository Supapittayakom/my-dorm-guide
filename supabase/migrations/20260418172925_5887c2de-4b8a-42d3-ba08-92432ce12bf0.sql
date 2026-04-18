-- Booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dorm_id UUID NOT NULL REFERENCES public.dorms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'single',
  check_in_date DATE NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1 CHECK (duration_months > 0),
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  contact_phone TEXT,
  message TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  owner_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX idx_bookings_dorm ON public.bookings(dorm_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own pending bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Owners
CREATE POLICY "Owners can view bookings for their dorms"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update bookings for their dorms"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admins
CREATE POLICY "Admins manage all bookings"
ON public.bookings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();