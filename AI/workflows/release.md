# Workflow: Release Preparation

This workflow outlines the step-by-step procedure to prepare the APC project for a production deployment. (Note: Detailed deployment infrastructure steps will be finalized in Phase 9: Deployment & DevOps).

---

## Step 1: Environment Variables & Config Audit
Verify that the runtime configuration is correct:
- [ ] Confirm all required server-side environment variables are defined in the deployment hosting provider.
- [ ] Ensure public environment variables (prefixed with `NEXT_PUBLIC_`) are correctly configured and available to client components.
- [ ] Verify that no API keys or development credentials are accidentally hardcoded in the codebase.

---

## Step 2: Build Verification
Run the production build compiler:
1. Clear the Next.js build cache (optional but recommended: delete the `.next` directory).
2. Run `npm run build` in your production-simulate environment.
3. Verify that all dynamic and static pages compile successfully with zero errors.
4. Ensure the bundle size is within reasonable bounds and check for any build optimization warnings.

---

## Step 3: SEO and Metadata Review
Ensure search engines can crawl the site correctly:
- [ ] Open `src/app/layout.tsx` and confirm that `metadata.metadataBase` is set to the correct production URL.
- [ ] Check page-specific titles and descriptions to ensure they are consistent, descriptive, and contain relevant keywords.
- [ ] Verify Open Graph (OG) social share images exist and are properly referenced in the page metadata.
- [ ] Confirm search engines are permitted to index the site (no residual `noindex` headers or robots.txt restrictions unless intentional).

---

## Step 4: Asset and Document Link Audit
Check all downloadable documents and static assets:
- [ ] Confirm the official APC paper application form exists at `public/documents/apc-shareholder-application.pdf` and that the download link on `/join` works correctly.
- [ ] Ensure all local images, icons, and logos resolve correctly under production paths without broken links.
- [ ] Test the jsPDF-generated Application receipt PDF to ensure layout grids and texts render correctly.

---

## Step 5: Performance Baseline Check
Confirm the website meets performance guidelines:
- [ ] Check page speeds on mobile and desktop (aim for Google Lighthouse Performance scores >= 90).
- [ ] Ensure large assets are compressed and dynamic routes utilize proper caching/SSG headers.

---

## Step 6: Deployment Trigger
*Detailed commands, deployment targets (e.g. Vercel, Netlify, AWS, or VPS), and post-deployment sanity tests will be written here in Phase 9.*
