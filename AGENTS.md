 # Architecture rules

- Use the connected Supabase client for OAuth instead of Lovable Cloud Auth, so identities and sessions belong to the external Supabase project.
- Use ImagePreview with react-zoom-pan-pinch for product-image inspection, so mouse and touch zoom share one accessible viewer.
- Keep category ancestry helpers in category-tree and store nesting through the existing parent_id relationship, so all depths share consistent paths and cycle-safe parent choices.- Format every number, price and date through src/lib/format.ts (Latin-digit Arabic locale), so digits stay consistent app-wide.
- Profile completeness (first/last name, +967 phone, GPS location) is enforced in ProtectedRoute via MandatoryOnboarding; phone_verified is only settable by admins/server (DB trigger), so future OTP can flip it safely.
- Favorites state lives in one react-query cache (useFavorites), so cards, detail page, Favorites page and the nav badge always agree.
- Cross-user profile lookups (phone uniqueness, merchant employee search/list) go through SECURITY DEFINER RPCs that return minimal fields, because profiles RLS only exposes a user's own row.
- listing_type is stored as 'sale' | 'rent' (isRentListing accepts legacy Arabic), and contact numbers are stored +967 and dialed via toYemenDialDigits.
- Status colors use semantic tokens (success/warning/info/destructive, primary-text for gold text) so contrast holds in light and dark themes.
- Deliver the approved Expo migration as a separate native source project without replacing the Vite website or reusing Capacitor native folders, so the existing application stays operational during migration.
- Keep Expo source checkpoints in project-controlled paths and stage clean download archives in /tmp only at packaging time, so temporary sandbox loss cannot erase the only source copy.
