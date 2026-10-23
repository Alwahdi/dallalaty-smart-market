# Expo migration recovery checkpoint

## Current status

The approved plan is archived under `.lovable/plan/تحويل-متجر-إب-إلى-react-native-expo-2026-10-22.md`.

The native source was created in `/tmp/matjer-ibb-expo`, but that directory disappeared before source packaging. The current checkout contains no Expo application and no downloadable native source archive. Do not describe this migration as completed or ready to build. The Vite website and connected Supabase data were not replaced.

Earlier command results reported 11 passing rule tests, 20/20 Expo Doctor checks, a passing TypeScript check, and JavaScript/Hermes exports for Android, iOS, and web. Those results describe the now-missing temporary source, not a deliverable or a verified native binary. No physical-device, authenticated end-to-end, Kotlin compilation, Swift compilation, or signed native build was completed.

## Implementation inventory

Recreate a separate React Native/Expo source project using the approved plan. Preserve source checkpoints in a project-controlled directory; stage archives in `/tmp` only after source is safely retained.

- SDK compatibility verified against published Expo 58.0.17 metadata: React 19.3.0, React Native 0.88.0, Expo Router 58.0.25. Confirm compatibility again when implementing.
- Use Expo Router, native Paper controls with centralized semantic theme colors, Cairo typography, safe areas, keyboard handling, RTL and Arabic/English strings.
- Retain external Supabase `matjer_ibb`; use the generated types and preserve tables/RPCs. No service-role key in native code.
- Reuse business helpers from `src/lib/format.ts`, `currency.ts`, and `category-tree.ts` with concrete rule tests.
- Persist native sessions with a secure-storage adapter handling large session values; use PKCE OAuth and origin/scheme-scoped callbacks. Share the in-flight exchange promise between callback callers, rather than returning early from duplicate exchanges.
- Auth scope: Google, email/password, signup/confirmation, password recovery, profile completeness, suspension gate, sign-out escape from onboarding, unique +967 phone and foreground GPS. OTP remains disabled.
- Customer scope: active products, hierarchical categories, search/city/listing/currency/price filters, product details, image zoom/gallery, video, shared favorites query cache, contact links, account/security/preferences, notifications and legal documents.
- Merchant scope: multiple stores, product create/edit/delete/status/media/custom fields, phone-based existing-user employee lookup, four permission switches, employee removal, store information.
- Administration scope: users, server-held email enumeration through `admin-list-users`, role management, suspension, all products, category CRUD/ancestry/field editor/order/status, category manager assignments, selected/all-recipient notification sends.
- Native device adapters: location, photo/video selection, image resize/avatar crop, file-byte uploads, share/linking, notifications and Sentry without default PII collection.
- Native video audio removal: local Expo module, Android MediaExtractor/MediaMuxer video-only remux with orientation/sample timestamps and content URI handling; iOS video-only composition/export with iOS 18 availability guard and older-system export continuation. This requires a development build, not Expo Go. Verify output has no audio track and works on devices.

## Important corrections before release

- Build store options from the user's merchant role, not ownership of the currently selected store. Do not give employee-only users a fictitious own store.
- Recheck employee/settings permission when rendering, not merely when hiding navigation buttons. Reset unauthorized views after store switches.
- Key employee/settings forms by merchant ID and synchronize form state from query data outside query functions; cached data must not carry a previous store's values into another store.
- Never claim atomic role updates using separate REST requests. Preserve backend contracts until an authorized transactional operation is available; guard against self-removal of admin role and report partial errors honestly.
- Permission guards are presentation only; production RLS/RPC/storage enforcement still requires cross-role testing.
- Ensure legal links resolve. Existing website legal copy includes unverified contact addresses, MFA and account-deletion claims; do not repeat unsupported claims in native copy. Legal copy needs owner review.
- Apply web document direction explicitly. Native direction changes require a reload/restart path; localized text alone is insufficient. Back icons must follow effective direction.
- Do not overwrite stored push tokens with Expo tokens without confirming the existing delivery backend supports them. Inbox/realtime/local foreground alerts are distinct from background remote push.
- Verify existing WebM media on iOS/Android and fail unsupported video uploads clearly instead of silently uploading audio.

## Release verification required

1. Recreate source and run rule tests, Expo dependency check, Expo Doctor, and native-source typecheck.
2. Compile Android and iOS native code, including the custom video module; JavaScript export is not a native build.
3. With authorized sessions, test sign-in → onboarding → catalog; product save → readback; favorite synchronization; store switching; employee permissions; administrative actions.
4. On devices test OAuth/recovery links, permissions, media upload/no-audio output, image gestures, keyboard, RTL/LTR, both themes and accessibility.
5. Document EAS initialization, environment variables, Supabase callback allowlist, signing and store accounts. Do not initiate paid builds or publish without authorization.
6. Create a clean source ZIP excluding credentials, dependencies, Git metadata and generated output; inspect entries before copying it into Files.