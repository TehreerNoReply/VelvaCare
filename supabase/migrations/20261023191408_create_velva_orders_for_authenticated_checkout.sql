/*
# Create authenticated Velva orders

1. New Tables
- `velva_orders`
  - `id`: UUID order identifier.
  - `user_id`: signed-in customer who placed the order.
  - `customer_name`: checkout name.
  - `customer_email`: account email used for order contact.
  - `items`: JSON order snapshot containing product names, quantities, and prices.
  - `total_amount`: total in Pakistani rupees.
  - `status`: order lifecycle status.
  - `created_at`: order timestamp.

2. Security
- RLS is enabled on `velva_orders`.
- Signed-in customers can create, view, and update only their own orders.
- Anonymous visitors cannot read or create orders.
- Grants are limited to authenticated CRUD operations.

3. Important Notes
- The order stores a snapshot of cart items so later product changes do not alter an existing order.
- WhatsApp and email handoff can use the returned order identifier without exposing another customer’s data.
*/

CREATE TABLE IF NOT EXISTS public.velva_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 120),
  customer_email text NOT NULL CHECK (position('@' in customer_email) > 1),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  total_amount numeric(12, 2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS velva_orders_user_created_idx ON public.velva_orders(user_id, created_at DESC);
ALTER TABLE public.velva_orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.velva_orders TO authenticated;

DROP POLICY IF EXISTS "Customers can view own orders" ON public.velva_orders;
CREATE POLICY "Customers can view own orders" ON public.velva_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Customers can create own orders" ON public.velva_orders;
CREATE POLICY "Customers can create own orders" ON public.velva_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Customers can update own orders" ON public.velva_orders;
CREATE POLICY "Customers can update own orders" ON public.velva_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
