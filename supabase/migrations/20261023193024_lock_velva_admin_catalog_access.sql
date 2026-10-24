/*
# Lock catalog writes to approved administrators

1. New Tables
- `velva_admins`
  - `user_id`: authenticated account approved to manage the store.
  - `email`: administrator contact label.
  - `created_at`: approval timestamp.

2. Security Changes
- Catalog, category, and review management is restricted to users listed in `velva_admins`.
- Anonymous users lose all write access to catalog, orders, profiles, and reviews.
- Customers retain only their own order/profile access.
- Product removal is expected to use `is_active = false`, preserving order history.

3. Important Notes
- No password is stored in this table. Supabase Auth owns passwords and password-reset emails.
- The first admin account must be approved by inserting its authenticated user id into `velva_admins`.
*/

CREATE TABLE IF NOT EXISTS public.velva_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.velva_admins ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.velva_admins TO authenticated;
DROP POLICY IF EXISTS "Admins can view own approval" ON public.velva_admins;
CREATE POLICY "Admins can view own approval" ON public.velva_admins FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.velva_categories FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.velva_products FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.velva_reviews FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.velva_orders FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.velva_profiles FROM anon;
GRANT SELECT ON public.velva_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.velva_profiles TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.velva_categories;
CREATE POLICY "Approved admins can create categories" ON public.velva_categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.velva_categories;
CREATE POLICY "Approved admins can update categories" ON public.velva_categories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.velva_categories;
CREATE POLICY "Approved admins can delete categories" ON public.velva_categories FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create products" ON public.velva_products;
CREATE POLICY "Approved admins can create products" ON public.velva_products FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.velva_products;
CREATE POLICY "Approved admins can update products" ON public.velva_products FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.velva_products;
CREATE POLICY "Approved admins can delete products" ON public.velva_products FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can moderate reviews" ON public.velva_reviews;
CREATE POLICY "Approved admins can moderate reviews" ON public.velva_reviews FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.velva_reviews;
CREATE POLICY "Approved admins can delete reviews" ON public.velva_reviews FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.velva_admins WHERE user_id = auth.uid()));
