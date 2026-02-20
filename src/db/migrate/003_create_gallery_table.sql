-- Migration: Create gallery_images table
-- Run with: npm run migrate
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster event-based queries and ordering
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON gallery_images(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_position ON gallery_images(event_id, position);
