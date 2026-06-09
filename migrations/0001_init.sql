CREATE TABLE IF NOT EXISTS clients (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT NOT NULL UNIQUE,
  target_pno  NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metrics_daily (
  id                SERIAL PRIMARY KEY,
  client_id         INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  channel           TEXT NOT NULL,
  visits            INTEGER NOT NULL,
  cost              NUMERIC(10,2) NOT NULL,
  conversions       INTEGER NOT NULL,
  conversion_value  NUMERIC(10,2) NOT NULL,
  UNIQUE (client_id, date, channel)
);

CREATE INDEX IF NOT EXISTS idx_metrics_client_date
  ON metrics_daily (client_id, date);
