-- Hospital ER Patient Management System Tables

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  insurance_id TEXT,
  arrival_time TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Patient Symptoms/Reasons for visit
CREATE TABLE IF NOT EXISTS public.patient_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  chief_complaint TEXT NOT NULL,
  description TEXT,
  priority_level TEXT NOT NULL DEFAULT 'moderate',
  priority_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting',
  room_assignment TEXT,
  checked_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
  seen_at TIMESTAMP,
  discharged_at TIMESTAMP,
  vital_signs JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vital Signs tracking
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.patient_visits(id) ON DELETE CASCADE,
  temperature DECIMAL(5, 2),
  blood_pressure_sys INT,
  blood_pressure_dia INT,
  heart_rate INT,
  respiratory_rate INT,
  oxygen_saturation DECIMAL(5, 2),
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ER Rooms/Beds
CREATE TABLE IF NOT EXISTS public.er_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  current_patient_id UUID REFERENCES public.patient_visits(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Priority Queue Log (for analytics)
CREATE TABLE IF NOT EXISTS public.queue_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id UUID NOT NULL REFERENCES public.patient_visits(id) ON DELETE CASCADE,
  priority_level TEXT NOT NULL,
  priority_score INT NOT NULL,
  queue_position INT,
  action TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for demo)
CREATE POLICY "patients_public_read" ON public.patients FOR SELECT USING (true);
CREATE POLICY "patients_public_insert" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "patients_public_update" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "patients_public_delete" ON public.patients FOR DELETE USING (true);

CREATE POLICY "visits_public_read" ON public.patient_visits FOR SELECT USING (true);
CREATE POLICY "visits_public_insert" ON public.patient_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "visits_public_update" ON public.patient_visits FOR UPDATE USING (true);
CREATE POLICY "visits_public_delete" ON public.patient_visits FOR DELETE USING (true);

CREATE POLICY "vitals_public_read" ON public.vital_signs FOR SELECT USING (true);
CREATE POLICY "vitals_public_insert" ON public.vital_signs FOR INSERT WITH CHECK (true);
CREATE POLICY "vitals_public_update" ON public.vital_signs FOR UPDATE USING (true);

CREATE POLICY "rooms_public_read" ON public.er_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_public_update" ON public.er_rooms FOR UPDATE USING (true);

CREATE POLICY "queue_log_public_read" ON public.queue_log FOR SELECT USING (true);
CREATE POLICY "queue_log_public_insert" ON public.queue_log FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_patient_visits_patient_id ON public.patient_visits(patient_id);
CREATE INDEX idx_patient_visits_status ON public.patient_visits(status);
CREATE INDEX idx_patient_visits_priority ON public.patient_visits(priority_score DESC);
CREATE INDEX idx_patient_visits_checked_in ON public.patient_visits(checked_in_at);
CREATE INDEX idx_vital_signs_visit_id ON public.vital_signs(visit_id);
CREATE INDEX idx_er_rooms_status ON public.er_rooms(status);
CREATE INDEX idx_queue_log_visit_id ON public.queue_log(visit_id);
