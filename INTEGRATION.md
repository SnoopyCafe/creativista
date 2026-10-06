# Public website and portal integration

Branch: feat/portal-integration. The public domain has not been changed.

## Routes
- /: original public homepage, with Portal in desktop and mobile menus.
- /shalimar: existing Shalimar page.
- /portal: family portal.
- /portal/login and /portal/reset-password: authentication.
- /portal/admin: staff workspace.
- /portal/api/* and /portal/auth/*: existing portal server routes, namespaced.

The existing Supabase project remains the data source. No data migration or permission changes are required. StepUp links use https://apply.stepupforstudents.org/.

## Configuration before production cutover
1. Configure the existing Supabase public URL and publishable key and the existing SMTP settings on the combined hosting project. Secrets must be set in hosting settings, never committed.
2. Add the production and approved preview /portal/auth/callback URLs to Supabase Auth redirect allowlists; retain the current portal callbacks during transition. Set the final site URL when launching.
3. The old PHP collector cannot run in Next.js. Keep it on the existing PHP host under a separate HTTPS hostname and set LEGACY_REFERRER_URL to that endpoint. The new same-origin /ref/collect.php handler forwards the existing visitor payload. Without this setting it returns 503 rather than pretending visits were recorded. Preserve its private CSV and access protections. Do not deploy PHP files as static assets.
4. Confirm public domain DNS/current hosting and /shalimar legacy links, HTTPS, public asset caching, booking modal, and desktop/mobile menu behavior.
5. Validate authenticated family/staff behavior and email delivery in a controlled preview. Avoid sending real invoices or invitations as tests.
6. Publish only after preview approval. Add old portal-domain redirects with path and query preservation (/ to /portal, /login to /portal/login, /admin/* to /portal/admin/*, /auth/* to /portal/auth/*). Keep previous hosting deployments and DNS values for rollback.

The public HTML documents are served as full HTML responses, preserving their CSS, scripts, SEO metadata, video, and booking behavior. Portal CSS is loaded only by portal routes. Runtime secrets and build output are excluded from Git.
