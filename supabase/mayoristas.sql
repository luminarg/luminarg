-- ═══════════════════════════════════════════════════════════════
--  MÓDULO MAYORISTAS
--  Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Tramos de precio por volumen ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS price_tiers (
  id               SERIAL PRIMARY KEY,
  name             TEXT        NOT NULL,
  min_quantity     INTEGER     NOT NULL,
  max_quantity     INTEGER,                          -- NULL = sin límite
  discount_pct     NUMERIC(5,2) NOT NULL DEFAULT 0, -- % sobre precio mayorista base
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tramos por defecto (modificables desde el panel)
INSERT INTO price_tiers (name, min_quantity, max_quantity, discount_pct, sort_order) VALUES
  ('Precio base',     1,   10,  0,  1),
  ('Volumen medio',  11,   20, 10,  2),
  ('Volumen alto',   21,   50, 15,  3),
  ('Distribuidor',   51, NULL, 20,  4);

-- ─── 2. Perfil de cliente mayorista ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mayorista_profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name     TEXT        NOT NULL,
  cuit             TEXT,
  address          TEXT,
  city             TEXT,
  province         TEXT,
  phone            TEXT,
  contact_name     TEXT,
  -- Condiciones comerciales
  payment_type     TEXT        NOT NULL DEFAULT 'contado', -- 'contado' | 'cuenta_corriente'
  credit_limit     NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance  NUMERIC(12,2) NOT NULL DEFAULT 0,  -- saldo deudor (+) / a favor (-)
  -- Estado
  is_approved      BOOLEAN     NOT NULL DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Transacciones de cuenta corriente ────────────────────────────────────

CREATE TABLE IF NOT EXISTS cc_transactions (
  id               SERIAL      PRIMARY KEY,
  customer_id      UUID        NOT NULL REFERENCES auth.users(id),
  type             TEXT        NOT NULL, -- 'cargo' | 'pago' | 'ajuste'
  amount           NUMERIC(12,2) NOT NULL,
  description      TEXT,
  sale_id          INTEGER     REFERENCES sales(id),
  balance_after    NUMERIC(12,2),
  created_by       UUID        REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_price_tiers_active     ON price_tiers(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_mayorista_approved      ON mayorista_profiles(is_approved);
CREATE INDEX IF NOT EXISTS idx_cc_transactions_customer ON cc_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cc_transactions_sale    ON cc_transactions(sale_id);
