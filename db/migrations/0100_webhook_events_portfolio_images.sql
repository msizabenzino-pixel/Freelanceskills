-- Migration: webhook_events + portfolio_images
-- Applied: 2026-06-10
-- Description: Idempotency store for PayFast/webhook events; per-user portfolio image gallery

CREATE TABLE IF NOT EXISTS webhook_events (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  source varchar(50) NOT NULL,
  event_type varchar(100) NOT NULL,
  idempotency_key varchar(255) NOT NULL,
  payload text,
  status varchar(20) NOT NULL DEFAULT 'processed',
  error_message text,
  processed_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  CONSTRAINT uq_webhook_events_idempotency UNIQUE (source, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at);

CREATE TABLE IF NOT EXISTS portfolio_images (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cloudinary_public_id varchar,
  url text NOT NULL,
  caption text,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_user ON portfolio_images(user_id);
