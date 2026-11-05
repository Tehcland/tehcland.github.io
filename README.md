# TEHCLAND

The existing five-page TEHCLAND website, modernized as a lightweight static site for GitHub Pages. The original repository and August 3, 2025 history are preserved.

## Preview and edit

The website needs no build step, database, paid service, or production JavaScript dependencies. Edit the five HTML pages directly. Shared styles, navigation, and optimized images live in `assets/`.

With Node.js 24.8 or newer:

```sh
npm run preview
```

Open `http://127.0.0.1:4174`. The preview binds only to the local machine. Existing routes remain `index.html`, `about.html`, `vision.html`, `grants.html`, and `contact.html`.

## Verify

Development dependencies are pinned in `package-lock.json` and do not ship to visitors.

```sh
npm ci
npx playwright install chromium
npm run check:html
npm run check:format
npm test
npm run test:performance
```

For an already installed Chromium, set `CHROMIUM_PATH` to its executable. In an isolated container that requires Chromium's sandbox to be disabled, also set `CHROMIUM_NO_SANDBOX=1`. Otherwise leave browser sandboxing enabled.

`npm test` checks all five pages at 320, 390, 768, 1024, and 1440 CSS pixels, audits desktop/mobile accessibility with axe, exercises keyboard navigation, verifies internal links and image loading, and checks no-JavaScript and reduced-motion behaviour. It captures desktop/mobile screenshots. The 200% zoom check uses the equivalent reduced CSS viewport; it does not claim a physical-device or assistive-technology audit.

`npm run test:performance` runs Lighthouse with its default simulated mobile throttling on all five pages. It requires performance scores of at least 90, accessibility scores of 100, and cumulative layout shift of at most 0.1. Results reflect local serving, not production network conditions.

Reports and screenshots go to ignored `review/` by default. Set `REVIEW_DIR` to choose another directory. No test submits enquiries or changes remote state.

## Content and imagery

- Describe micro-hydro as exploratory; renewable generation and battery storage are compatible.
- Do not claim grants, applications, registration, partnerships, permits, facilities, infrastructure, or visits are confirmed without evidence.
- Contact currently has no submission form or verified public enquiry address. GitHub is linked for project information. Confirm a contact channel before offering enquiries.
- Existing photographs illustrate themes, not verified TEHCLAND locations, facilities, or completed work. Original files remain unchanged. Building imagery and watermarked energy/stream imagery are not displayed.
- Optimized WebP images derive from `healing_retreat_scene.jpg` (river), `pollinator_garden.jpg` (pollinator), and `native_forest_restoration.jpg` (landscape card). Some originals contain AVIF data despite their `.jpg` filenames; derivatives have matching encoding and extensions.
- The Ontario conservation resource is a tax incentive, not a general project grant. Linking to a programme does not establish eligibility or participation.

## Review and release

Work belongs on `redesign/ecological-community`, based on the original `Tehcland/tehcland.github.io` repository. See `REVIEW.md` for the review record.

Keep the change unmerged until Ihor approves release. Do not publish previews externally, change DNS, or add paid services without approval. Creating a local preview or a review PR does not authorize publication.
