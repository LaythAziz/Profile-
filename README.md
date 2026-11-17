# Laith Aziz Al-Mousawi — Personal Portfolio

A responsive Arabic-first portfolio for Laith Aziz Al-Mousawi, Environmental Engineer, AI Engineer, and Developer.

## Highlights
- Black and neon visual identity with responsive layouts
- Arabic RTL presentation and accessible navigation
- Animated hero portrait, orbital details, particle network, and scroll reveals
- Expertise: iOS Development, Reverse Engineering, AI & Machine Learning, SwiftUI, Python, JavaScript, Web Development, Objective-C, Node.js, Environmental Engineering
- Selected work and social contact links
- Reduced-motion support
- No build step required

## Run locally
Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Profile image
The page uses the existing `assets/layth.jpg` image.

## Contact links
GitHub and Instagram are connected. X, WhatsApp, and Telegram are shown with their official brand marks but are intentionally inactive until the correct personal account URLs are supplied.


## Current architecture and quality checks
- Static portfolio shell in `index.html`; cacheable styles and deferred interactions live in `assets/profile.css` and `assets/profile.js`.
- Vercel response headers are configured in `vercel.json`; static assets use short-lived browser caching with stale revalidation.
- Telegram MTProto feed is served by `api/telegram-proxies.js`, with two upstream sources, validation, parallel fallback, and edge caching.
- Search metadata includes canonical/Open Graph/Twitter tags, Person JSON-LD, `robots.txt`, and `sitemap.xml`.
- Public social profiles are linked in the contact section.
- Run regression tests with `node --test tests/*.test.cjs`; GitHub Actions runs the suite on pushes and pull requests.
- Order submission currently hands the user off to Telegram. Durable order storage, customer accounts, admin management, and analytics require a separate configured database and authenticated backend; the public page does not pretend to persist these records.
