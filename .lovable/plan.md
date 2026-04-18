
The user wants a comprehensive end-to-end QA review of the entire app: auth flows, all roles, UI/UX, every component and page. I'm in READ-ONLY/plan mode, so I'll outline the QA plan for approval, then execute it (browser testing + creating test accounts + fixes) once approved.

Scope to cover:
1. Auth flows: signup (email/password), signin, Google OAuth, phone collection skip, password validation, email confirmation status
2. Role system: create test accounts for each role (admin, properties_admin, categories_admin, notifications_admin, moderator, regular user) and verify access boundaries
3. Admin panel: every tab — Properties/Items, Categories with custom_fields editor, Users management, Notifications, Sections
4. Public flows: Landing → Auth → Index/Home → Browse Properties → Product Detail (dynamic fields) → Favorites → Account Settings
5. UI/UX audit: RTL alignment, mobile (375px), tablet (768px), desktop (1280px), icon ordering in BottomNav, header layout, empty states, loading states, error states
6. Functional: image/video upload, mute video, dynamic custom fields rendering on detail page, search/filter, notifications real-time
7. Backend: RLS policies, security scan, linter, check for orphaned references to old fields (bedrooms/bathrooms/property_type)
8. Console errors, network failures, Sentry-worthy issues

Deliverables:
- Categorized issue list (Critical / High / Medium / Low / Polish)
- Fix each issue in order of severity
- Re-test after fixes
- Final sign-off report in Arabic
