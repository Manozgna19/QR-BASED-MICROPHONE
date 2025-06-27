
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.speaking_requests CASCADE;
DROP TABLE IF EXISTS public.attendees CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.moderators CASCADE;

-- Create moderators table
CREATE TABLE public.moderators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_code TEXT NOT NULL UNIQUE,
  moderator_id UUID NOT NULL REFERENCES public.moderators(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  accepting_requests BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create speaking_requests table
CREATE TABLE public.speaking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, dismissed, completed
  queue_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (we'll handle auth in application logic)
CREATE POLICY "Allow all operations on moderators" ON public.moderators FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow all operations on speaking_requests" ON public.speaking_requests FOR ALL USING (true);

-- Enable real-time updates
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.speaking_requests REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.speaking_requests;
