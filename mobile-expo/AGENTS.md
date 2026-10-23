# Native architecture rules
- Use Expo Router routes and native Paper controls, with shared semantic colors and typography in AppProviders, because the native app must not depend on DOM or the website bundle.
- Use the external Supabase schema snapshot and authenticated client for all data; UI permission guards never replace existing server RLS.
- Keep session storage chunked in SecureStore and validate callback destinations before PKCE exchange; callback callers share an in-flight promise to avoid consuming the same code twice.
- Query customer favorites through the single user-keyed React Query cache; invalidate product reads only after successful checked mutations.
- Discover stores from merchant roles and employee membership, and recheck permission for the selected store on each protected screen.
- Process new videos through the local VideoMute Expo module and verify video-only output before upload; missing native support must fail closed rather than upload audio.
- Preserve notification inbox/realtime semantics without writing Expo push tokens into profiles; the existing backend has no verified Expo push delivery contract.
- Keep source, native module and rule tests in this directory; exclude credentials, dependencies and generated native/build output from source deliveries.