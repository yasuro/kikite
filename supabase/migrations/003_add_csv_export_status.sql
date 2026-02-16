-- Add CSV export status columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS is_csv_exported boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS csv_exported_at timestamptz;

-- Add index for CSV export status
CREATE INDEX IF NOT EXISTS idx_orders_is_csv_exported ON public.orders (is_csv_exported);

-- Comment on columns
COMMENT ON COLUMN public.orders.is_csv_exported IS 'CSV出力済みフラグ';
COMMENT ON COLUMN public.orders.csv_exported_at IS 'CSV出力日時';