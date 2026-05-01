-- =============================================================
-- LUMINARG — Módulo de Compras: Fase 1
-- Ejecutar en Supabase → SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. PRODUCTOS: agregar columnas de stock en tránsito y en pedido
-- -------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_en_transito INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_en_pedido   INTEGER NOT NULL DEFAULT 0;


-- -------------------------------------------------------------
-- 2. CONFIGURACIÓN DE LA EMPRESA
--    Datos editables desde el panel (para imprimir en la OC)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id         SERIAL PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales (editables luego desde /internal/settings)
INSERT INTO company_settings (key, value) VALUES
  ('company_name',    'Luminarg'),
  ('company_cuit',    ''),
  ('company_address', ''),
  ('company_phone',   ''),
  ('company_email',   ''),
  ('company_web',     ''),
  ('company_bank',    '')
ON CONFLICT (key) DO NOTHING;


-- -------------------------------------------------------------
-- 3. PROVEEDORES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  country       TEXT,
  currency      TEXT DEFAULT 'USD',
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 4. AGENTES DE IMPORTACIÓN
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_agents (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  company          TEXT,
  contact_name     TEXT,
  contact_email    TEXT,
  contact_phone    TEXT,
  commission_rate  NUMERIC(5,2),   -- porcentaje, ej: 3.50
  notes            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 5. ÓRDENES DE COMPRA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
  id                     SERIAL PRIMARY KEY,
  order_number           TEXT UNIQUE NOT NULL,          -- ej: OC-2025-001
  supplier_id            INTEGER REFERENCES suppliers(id),
  import_agent_id        INTEGER REFERENCES import_agents(id),
  order_date             DATE,
  estimated_arrival      DATE,
  actual_arrival         DATE,
  status                 TEXT NOT NULL DEFAULT 'pendiente',
  -- valores: 'pendiente' | 'en_transito' | 'recibido'
  currency               TEXT NOT NULL DEFAULT 'USD',
  exchange_rate          NUMERIC(12,4),                 -- tipo de cambio al momento
  -- Desglose financiero
  goods_cost             NUMERIC(12,2),                 -- costo pactado de mercadería
  financial_disbursement NUMERIC(12,2),                 -- desembolso financiero real
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 6. ITEMS DE LA ORDEN DE COMPRA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                  SERIAL PRIMARY KEY,
  purchase_order_id   INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id          INTEGER REFERENCES products(id),  -- puede ser NULL si el producto aún no existe
  description         TEXT,                             -- nombre libre si no hay product_id
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price          NUMERIC(12,4),                    -- puede ser NULL si el precio no está pactado
  currency            TEXT DEFAULT 'USD',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 7. COSTOS ADICIONALES DE LA ORDEN
--    (flete, aduana, seguro, agente, impuestos, otros)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_costs (
  id                  SERIAL PRIMARY KEY,
  purchase_order_id   INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  -- valores sugeridos: 'flete' | 'aduana' | 'seguro' | 'agente' | 'impuesto' | 'otros'
  description         TEXT,
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'ARS',
  is_paid             BOOLEAN NOT NULL DEFAULT false,
  paid_date           DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 8. PAGOS DE LA ORDEN
--    (adelanto, saldo, cuotas)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_payments (
  id                  SERIAL PRIMARY KEY,
  purchase_order_id   INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  -- valores: 'adelanto' | 'saldo' | 'cuota'
  description         TEXT,
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'USD',
  scheduled_date      DATE,
  paid_date           DATE,
  is_paid             BOOLEAN NOT NULL DEFAULT false,
  payment_method      TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 9. ÍNDICES para performance
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
  ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier
  ON purchase_orders(supplier_id);

CREATE INDEX IF NOT EXISTS idx_po_items_order
  ON purchase_order_items(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_po_items_product
  ON purchase_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_po_costs_order
  ON purchase_order_costs(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_po_payments_order
  ON purchase_order_payments(purchase_order_id);


-- =============================================================
-- FIN DEL SCRIPT
-- =============================================================
