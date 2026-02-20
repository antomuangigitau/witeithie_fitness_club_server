CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  registration_id UUID NOT NULL
    REFERENCES registrations(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL CHECK (amount > 0),

  mpesa_code VARCHAR(20) UNIQUE,

  payer_phone VARCHAR(20),

  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed')),

  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only one successful payment per registration
CREATE UNIQUE INDEX uniq_completed_payment
ON payments(registration_id)
WHERE payment_status = 'completed';

CREATE INDEX idx_payments_registration
ON payments(registration_id);
