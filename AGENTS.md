 # Architecture rules

- Use the connected Supabase client for OAuth instead of Lovable Cloud Auth, so identities and sessions belong to the external Supabase project.
- Use ImagePreview with react-zoom-pan-pinch for product-image inspection, so mouse and touch zoom share one accessible viewer.
- Keep category ancestry helpers in category-tree and store nesting through the existing parent_id relationship, so all depths share consistent paths and cycle-safe parent choices.- Format every number, price and date through src/lib/format.ts (Latin-digit Arabic locale), so digits stay consistent app-wide.
- Profile completeness (first/last name, +967 phone, GPS location) is enforced in ProtectedRoute via MandatoryOnboarding; phone_verified is only settable by admins/server (DB trigger), so future OTP can flip it safely.
