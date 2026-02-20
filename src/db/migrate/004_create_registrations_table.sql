CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone_number VARCHAR(20) NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX uniq_registration_event_phone
ON registrations(event_id, phone_number);

CREATE INDEX idx_registrations_event
ON registrations(event_id);
