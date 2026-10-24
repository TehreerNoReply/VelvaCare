/*
# Create Velva catalog tables

1. New Tables
- `velva_categories`: public product groupings used by the storefront.
  - `id`: UUID primary key.
  - `name`: customer-facing category name.
  - `slug`: stable URL-friendly identifier.
  - `created_at`: creation timestamp.
- `velva_products`: cosmetics catalog records used by the storefront and admin area.
  - `id`: UUID primary key.
  - `category_id`: optional category relationship.
  - `name`: product name.
  - `slug`: stable URL-friendly identifier.
  - `description`: product detail copy.
  - `price`: price in Pakistani rupees.
  - `compare_at_price`: optional original price.
  - `image_url`: product image URL.
  - `stock_quantity`: available inventory count.
  - `is_featured`: whether to show in featured collections.
  - `is_active`: whether the product is visible in the storefront.
  - `created_at`, `updated_at`: record timestamps.

2. Security
- Row level security is enabled on both tables.
- Anonymous and authenticated visitors can read active catalog content.
- Catalog creation, editing, and deletion are restricted to authenticated users.
- Authenticated management policies are separated by CRUD operation.
- Grants only expose the operations used by the storefront and admin area.

3. Important Notes
- This migration is additive and does not remove or rename any existing data.
- Admin authentication can be connected to Supabase email/password accounts when the admin sign-in screen is enabled.
*/

CREATE TABLE IF NOT EXISTS public.velva_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.velva_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.velva_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  image_url text NOT NULL DEFAULT '',
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS velva_products_category_id_idx ON public.velva_products(category_id);
CREATE INDEX IF NOT EXISTS velva_products_active_featured_idx ON public.velva_products(is_active, is_featured);

ALTER TABLE public.velva_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.velva_products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.velva_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.velva_categories TO authenticated;
GRANT SELECT ON public.velva_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.velva_products TO authenticated;

DROP POLICY IF EXISTS "Public can view categories" ON public.velva_categories;
CREATE POLICY "Public can view categories" ON public.velva_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.velva_categories;
CREATE POLICY "Authenticated users can create categories" ON public.velva_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.velva_categories;
CREATE POLICY "Authenticated users can update categories" ON public.velva_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.velva_categories;
CREATE POLICY "Authenticated users can delete categories" ON public.velva_categories FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can view active products" ON public.velva_products;
CREATE POLICY "Public can view active products" ON public.velva_products FOR SELECT TO anon, authenticated USING (is_active = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.velva_products;
CREATE POLICY "Authenticated users can create products" ON public.velva_products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.velva_products;
CREATE POLICY "Authenticated users can update products" ON public.velva_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.velva_products;
CREATE POLICY "Authenticated users can delete products" ON public.velva_products FOR DELETE TO authenticated USING (true);
