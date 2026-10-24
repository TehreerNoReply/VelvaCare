/*
# Add country-aware customer phone details

1. Modified Table
- `velva_profiles`
  - `country`: customer's selected country.
  - `phone_country_code`: selected international dialing code.
  - `phone`: full phone number including country code, stored without spaces.

2. Security
- Existing owner-only profile policies remain unchanged.
- Authenticated users can continue to access only their own profile.

3. Important Notes
- Existing profiles receive Pakistan as the default country and +92 as the default code.
- Phone validation now accepts an international E.164-style value beginning with `+`.
*/

ALTER TABLE public.velva_profiles ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Pakistan';
ALTER TABLE public.velva_profiles ADD COLUMN IF NOT EXISTS phone_country_code text NOT NULL DEFAULT '+92';
ALTER TABLE public.velva_profiles DROP CONSTRAINT IF EXISTS velva_profiles_phone_check;
ALTER TABLE public.velva_profiles ADD CONSTRAINT velva_profiles_phone_check CHECK (phone ~ '^\\+[1-9][0-9]{7,14}$');
