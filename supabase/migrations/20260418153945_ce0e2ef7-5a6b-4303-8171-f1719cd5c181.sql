ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'YER';

ALTER TABLE public.properties ADD CONSTRAINT properties_currency_check CHECK (currency IN ('YER', 'SAR', 'USD'));