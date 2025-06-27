
-- Create attendees table
CREATE TABLE public.attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  attendee_id TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create speaking_requests table
CREATE TABLE public.speaking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendee_id TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (attendee_id) REFERENCES public.attendees(attendee_id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for attendees table (allow public access for registration)
CREATE POLICY "Allow public insert on attendees" 
  ON public.attendees 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select on attendees" 
  ON public.attendees 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public update on attendees" 
  ON public.attendees 
  FOR UPDATE 
  USING (true);

-- Create policies for speaking_requests table
CREATE POLICY "Allow public insert on speaking_requests" 
  ON public.speaking_requests 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select on speaking_requests" 
  ON public.speaking_requests 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public update on speaking_requests" 
  ON public.speaking_requests 
  FOR UPDATE 
  USING (true);
