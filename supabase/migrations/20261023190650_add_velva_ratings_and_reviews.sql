/*
# Add Velva product ratings and customer reviews

1. Modified Tables
- `velva_products`
  - `average_rating`: calculated/display rating from 0 to 5.
  - `rating_count`: number of ratings received.

2. New Tables
- `velva_reviews`: customer feedback shown on the storefront.
  - `id`: UUID primary key.
  - `product_id`: optional product relationship.
  - `customer_name`: display name.
  - `rating`: whole-number rating from 1 to 5.
  - `review_text`: customer message.
  - `is_visible`: moderation visibility flag.
  - `created_at`: submission timestamp.

3. Security
- RLS is enabled on `velva_reviews`.
- Visitors can read visible reviews and submit a review.
- Authenticated admin users can update visibility and delete reviews.
- Existing product catalog access is preserved.

4. Important Notes
- This migration is additive and does not delete or rename existing product data.
- Rating values are checked at the database boundary so invalid values cannot be stored.
*/

ALTER TABLE public.velva_products
  ADD COLUMN IF NOT EXISTS average_rating numeric(2, 1) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5);

ALTER TABLE public.velva_products
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0 CHECK (rating_count >= 0);

CREATE TABLE IF NOT EXISTS public.velva_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.velva_products(id) ON DELETE SET NULL,
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 80),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL CHECK (char_length(review_text) BETWEEN 5 AND 500),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS velva_reviews_product_id_idx ON public.velva_reviews(product_id);
CREATE INDEX IF NOT EXISTS velva_reviews_visible_created_idx ON public.velva_reviews(is_visible, created_at DESC);

ALTER TABLE public.velva_reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.velva_reviews TO anon, authenticated;
GRANT UPDATE, DELETE ON public.velva_reviews TO authenticated;

DROP POLICY IF EXISTS "Visitors can read visible reviews" ON public.velva_reviews;
CREATE POLICY "Visitors can read visible reviews" ON public.velva_reviews FOR SELECT TO anon, authenticated USING (is_visible = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Visitors can submit reviews" ON public.velva_reviews;
CREATE POLICY "Visitors can submit reviews" ON public.velva_reviews FOR INSERT TO anon, authenticated WITH CHECK (is_visible = true);
DROP POLICY IF EXISTS "Authenticated users can moderate reviews" ON public.velva_reviews;
CREATE POLICY "Authenticated users can moderate reviews" ON public.velva_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.velva_reviews;
CREATE POLICY "Authenticated users can delete reviews" ON public.velva_reviews FOR DELETE TO authenticated USING (true);
