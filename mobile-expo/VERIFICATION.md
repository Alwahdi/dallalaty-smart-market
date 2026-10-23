# Verification — 2026-10-23

## Passed on this retained source

- 12/12 concrete business-rule tests: currencies, Latin digits, +967 validation, dial links, rent/sale, nested categories/cycle-safe parent choices, fail-closed permissions, area roles, mandatory profile fields and internal notification destinations.
- TypeScript native source check (`bun run typecheck`).
- Expo dependency alignment (`expo install --check`).
- Expo Doctor: 20/20 checks passed.
- Expo export for Android, iOS and web: completed. These are JavaScript/Hermes bundles, not native binaries.
- Autolinking discovery found `VideoMuteModule` for Android and Apple, including its source directories.
- Browser exercise of Expo Web: login screen, empty-email recovery validation, privacy and terms, missing recovery-session state, signed-out merchant route redirects to auth. No page errors observed.
- Screenshots inspected at 390×844 mobile and 1280×1800 desktop; no overlapping controls on inspected screens.
- Existing Vite website preview build remains OK; no website or Supabase data migration occurred.

## Not verified and blocked externally

- Real customer/merchant/admin sign-in and saved-data readback: external unmanaged Supabase has no authorized test session here.
- Google callback, confirmation/recovery links and real email settings: hosted settings and device session unavailable.
- Kotlin/Swift compilation, video no-audio output and codec compatibility: no Android SDK/Xcode/device available. Source autolinking is not compilation.
- Native media picker, GPS, keyboard/safe areas, touch zoom, language-direction restart and system notifications: require Android/iOS device or emulator.
- Signed APK/AAB/IPA and store submission: require EAS project, signing, account setup and user authorization. No paid build or publishing was started.
- Cross-role server permission behavior: current RLS limitations are documented in README; presenting an admin button is not proof its write is allowed.

## Known nonfatal export warning

Expo Router 58.0.25 package metadata references a missing exported router-store JavaScript file. Metro fell back to file resolution and completed all exports. This is a dependency warning, not a verified native crash; device testing still required.

## Source release gate

This ZIP is a retained source checkpoint with all requested screen domains, not a declaration that every real-device or server flow is ready for production. Finish the external checks and server permission review above before store release.