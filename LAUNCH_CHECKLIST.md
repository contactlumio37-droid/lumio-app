# Lumio — Launch Checklist

## Auth & Backend

- [ ] Supabase Google OAuth provider configured (Dashboard → Authentication → Providers → Google)
- [ ] Supabase email templates customised (Dashboard → Authentication → Email Templates)
- [ ] `SUPABASE_ACCESS_TOKEN` secret set in GitHub repo
- [ ] `VITE_SUPABASE_PROJECT_ID` secret set in GitHub repo
- [ ] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets set in GitHub repo
- [ ] `VITE_REVENUECAT_API_KEY` secret set in GitHub repo
- [ ] Firebase Hosting secrets set in GitHub repo (`FIREBASE_SERVICE_ACCOUNT`, etc.)
- [ ] Supabase RLS enabled on all tables (verify in Dashboard → Table Editor)
- [ ] Edge Functions deployed: `delete-user`, `revenuecat-webhook`, `pulse-runner`
- [ ] RevenueCat webhook URL configured to point to `revenuecat-webhook` Edge Function

## Firebase → Supabase User Migration

- [ ] Run locally: `firebase auth:export /tmp/users_export.json --format=json`
- [ ] Run locally: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-firebase-to-supabase.mjs`
- [ ] Verify migrated accounts can sign in via "Continuer avec Google"

## Legal & Privacy

- [ ] `PrivacyPolicy.jsx` — fill in real developer name / company and postal address (section 1)
- [ ] Verify CNIL compliance (https://www.cnil.fr/fr/conformite-rgpd-outils-de-la-cnil)
- [ ] GDPR banner visible on first load (GdprBanner component)
- [ ] Contact email `privacy@lumio.app` is monitored

## PWA & SEO

- [ ] Create `public/og-image.png` (1200×630px) for social sharing
- [ ] Create `public/apple-touch-icon.png` (180×180px) for iOS home screen
- [ ] Add `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` to `index.html`
- [ ] Test PWA install prompt on Chrome Android
- [ ] Test Lighthouse score (target: Performance ≥ 85, Accessibility ≥ 90)
- [ ] Verify `robots.txt` is accessible at production URL `/robots.txt`
- [ ] Verify `manifest.json` is valid (Chrome DevTools → Application → Manifest)

## Store / Distribution

- [ ] App Store listing copy written and reviewed
- [ ] Google Play listing copy written and reviewed
- [ ] Store screenshots created (at least 3 per platform)
- [ ] App icon exported at all required sizes
- [ ] Age rating questionnaire completed (both stores)
- [ ] Privacy policy URL submitted to both stores

## Testing

- [ ] Sign up with email/password → onboarding shown → home loads
- [ ] Sign in with Google → onboarding shown → home loads
- [ ] Onboarding "Commencer →" marks `onboarding_done = true` in Supabase
- [ ] Returning user (onboarding done) → goes directly to Home
- [ ] PaywallModal opens → PurchaseScreen displayed
- [ ] RevenueCat purchase flow completes without error (sandbox)
- [ ] Account deletion removes all user data and auth record
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes

## Performance

- [ ] Bundle analysed: `npx vite-bundle-visualizer` (target gzip ≤ 400 KB)
- [ ] Images lazy-loaded / compressed
- [ ] Verify no secrets in built bundle (`grep -r "SUPABASE_SERVICE_ROLE" dist/`)

## Monitoring

- [ ] Supabase logs reviewed before launch (Dashboard → Logs)
- [ ] Error tracking configured (Sentry or similar) — optional but recommended
- [ ] RevenueCat dashboard accessible and showing correct entitlements

## Go / No-Go

- [ ] All P0 items above checked
- [ ] Staging deploy verified via `workflow_dispatch` → staging
- [ ] Squash-merge PR #34 to `main`
- [ ] Auto-deploy to production triggered on merge to `main`
