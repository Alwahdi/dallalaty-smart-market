# Roadmap — UX audit fixes
- [ ] Verify Google return on the installed app: source requests matjeribb://auth/callback and Supabase authorize echoes it; actual hosted allowlist and device callback remain unverified, awaiting the user's installed-app context.
- [x] A: Listings/favorites/contact/merchant
- [x] B: Shell/nav/auth/account/contrast

# React Native Expo migration
- [x] Review and approve complete migration scope and delivery plan.
- [x] Complete the recovered persistent mobile-expo source: auth, customer, merchant, admin, media and native adapters.
- [x] Run 12 source rule tests, dependency validation, typecheck, 20/20 Expo Doctor and Android/iOS/web JavaScript exports; Arabic build guide included.
- [x] Package and inspect clean 67-file source ZIP for delivery, including Kotlin/Swift sources and Arabic guide; exclude dependencies, secrets and generated output.
- [ ] Verify authenticated customer, merchant, and admin flows: external Supabase sessions and native-device testing are unavailable here.
- [ ] Signed native release and device validation: blocked on EAS setup, signing, OAuth allowlist and Android/iOS tools or device.
- [ ] Verify cross-role server actions: blocked on authorized external Supabase sessions; existing RLS limitations documented in mobile-expo/README.md.
