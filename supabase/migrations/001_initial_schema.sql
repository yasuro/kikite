-- =============================================================
-- 新受注入力Webアプリ DBマイグレーション
-- Supabase SQL Editor で実行してください
-- =============================================================

-- ----- 1. app_settings テーブル -----
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----- 2. products テーブル（商品マスタ） -----
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  regular_price integer NOT NULL,
  early_price integer,
  is_free_shipping boolean NOT NULL DEFAULT false,
  shipping_type text,
  stock_quantity integer,
  noshi_available boolean NOT NULL DEFAULT false,
  wrapping_available boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_code ON public.products (code);

-- ----- 3. customers テーブル（顧客マスタ） -----
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  postal_code text NOT NULL,
  prefecture text NOT NULL,
  address1 text NOT NULL,
  phone text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_code ON public.customers (code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (name);

-- ----- 4. orders テーブル（注文ヘッダ） -----
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  order_datetime timestamptz NOT NULL DEFAULT now(),
  operator_name text NOT NULL,
  operator_email text NOT NULL,
  customer_code text,
  customer_name text NOT NULL,
  customer_name_kana text,
  postal_code text NOT NULL,
  prefecture text NOT NULL,
  customer_address1 text NOT NULL,
  customer_address2 text,
  customer_company text,
  customer_department text,
  customer_phone text,
  customer_email text,
  payment_method text NOT NULL
    CONSTRAINT chk_payment_method CHECK (
      payment_method IN ('代金引換', 'クレジットカード', '銀行振込', '後払い')
    ),
  subtotal integer NOT NULL DEFAULT 0,
  total_shipping_fee integer NOT NULL DEFAULT 0,
  total_wrapping_fee integer NOT NULL DEFAULT 0,
  total_fee integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total_amount integer NOT NULL DEFAULT 0,
  order_memo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_datetime ON public.orders (order_datetime);
CREATE INDEX IF NOT EXISTS idx_orders_customer_code ON public.orders (customer_code);

-- ----- 5. order_details テーブル（注文明細） -----
CREATE TABLE IF NOT EXISTS public.order_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  product_code text NOT NULL,
  product_name text NOT NULL,
  unit_price integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  line_total integer NOT NULL,
  delivery_name text NOT NULL,
  delivery_name_kana text,
  delivery_phone text,
  delivery_postal_code text NOT NULL,
  delivery_prefecture text NOT NULL,
  delivery_address1 text NOT NULL,
  delivery_address2 text,
  delivery_company text,
  delivery_department text,
  delivery_date date,
  delivery_time text,
  delivery_method text,
  shipping_fee integer NOT NULL DEFAULT 0,
  delivery_memo text,
  noshi_flag boolean NOT NULL DEFAULT false,
  noshi_type text,
  noshi_position text,
  noshi_inscription text,
  noshi_inscription_custom text,
  noshi_name text,
  wrapping_flag boolean NOT NULL DEFAULT false,
  wrapping_type text,
  wrapping_fee integer NOT NULL DEFAULT 0,
  message_card text,
  line_memo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_details_order_id ON public.order_details (order_id);
CREATE INDEX IF NOT EXISTS idx_order_details_product_code ON public.order_details (product_code);

-- ----- 6. updated_at 自動更新トリガー -----
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_order_details_updated_at
  BEFORE UPDATE ON public.order_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ----- 7. 受注番号採番関数 -----
-- 形式: YYYYMMDD-NNNN（例: 20250211-0001）
-- 同日内で連番を自動インクリメント
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  today_str text;
  next_seq integer;
BEGIN
  today_str := to_char(now() AT TIME ZONE 'Asia/Tokyo', 'YYYYMMDD');

  SELECT COALESCE(
    MAX(
      CAST(split_part(order_number, '-', 2) AS integer)
    ), 0
  ) + 1
  INTO next_seq
  FROM public.orders
  WHERE order_number LIKE today_str || '-%';

  RETURN today_str || '-' || lpad(next_seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ----- 8. Row Level Security -----

-- orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "orders_delete" ON public.orders
  FOR DELETE TO authenticated USING (true);

-- order_details
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_details_select" ON public.order_details
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "order_details_insert" ON public.order_details
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "order_details_update" ON public.order_details
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "order_details_delete" ON public.order_details
  FOR DELETE TO authenticated USING (true);

-- products（参照のみ）
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products
  FOR SELECT TO authenticated USING (true);

-- customers（参照のみ）
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON public.customers
  FOR SELECT TO authenticated USING (true);

-- app_settings（参照 + 更新）
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_select" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "app_settings_update" ON public.app_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----- 9. 初期データ -----
INSERT INTO public.app_settings (key, value, description) VALUES
  ('early_price_deadline', '2025-11-28T23:59:59+09:00', '早割価格の適用期限（この日時まで早割適用）'),
  ('default_shipping_fee', '880', 'デフォルト送料（税込・円）'),
  ('free_shipping_threshold', '5000', '送料無料閾値（配送先単位の合計がこの金額以上で送料無料・円）')
ON CONFLICT (key) DO NOTHING;

-- ----- 10. テスト用サンプル商品データ（動作確認用） -----
INSERT INTO public.products (code, name, regular_price, early_price, is_free_shipping, shipping_type, stock_quantity, noshi_available, wrapping_available) VALUES
  ('TEST001', 'テスト商品A（通常便）', 3240, 2980, false, '通常便', 100, true, true),
  ('TEST002', 'テスト商品B（冷蔵便・送料無料）', 5400, 4800, true, '冷蔵便', 50, true, true),
  ('TEST003', 'テスト商品C（のし不可）', 1620, NULL, false, '通常便', 200, false, false),
  ('9999', '調整用ダミー商品', 0, NULL, false, NULL, NULL, false, false)
ON CONFLICT (code) DO NOTHING;
