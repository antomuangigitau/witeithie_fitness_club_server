-- psql -U postgres -d events_db -f src/db/migrations/001_create_events_table.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_datetime TIMESTAMPTZ NOT NULL,
    location VARCHAR(255) NOT NULL,
    distance VARCHAR(50) NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 50,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    image_url TEXT,
    price DECIMAL(10, 2),
    itinerary JSONB,
    guide JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_events_date ON events(event_datetime);
CREATE INDEX idx_events_difficulty ON events(difficulty);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_price ON events(price);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_updated_at ON events(updated_at);
CREATE INDEX idx_events_distance ON events(distance);
CREATE INDEX idx_events_guide ON events USING GIN (guide);
CREATE INDEX idx_events_itinerary ON events USING GIN (itinerary);
CREATE INDEX idx_events_title_description ON events USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_events_fulltext ON events USING GIN (to_tsvector('english', title || ' ' || description || ' ' || location));

