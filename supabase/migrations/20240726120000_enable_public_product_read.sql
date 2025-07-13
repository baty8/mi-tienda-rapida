
-- Enable Row Level Security for the products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;

-- Create a new policy to allow anyone to read from the products table
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
USING (true);

-- Enable Row Level Security for the tenants table if not already enabled
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to tenants" ON public.tenants;

-- Create a new policy to allow anyone to read from the tenants table
CREATE POLICY "Allow public read access to tenants"
ON public.tenants FOR SELECT
USING (true);
