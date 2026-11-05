# TEHCLAND redesign review

## Change

All five existing pages now share a responsive forest-green and cream design, semantic landmarks, readable typography, keyboard focus states, mobile navigation, and clear calls to action. The homepage introduces restoration, learning, and inclusion through a prominent hero and image-led sections.

The original routes and image files are preserved. Styles and navigation are shared; images are served as responsive, dimensioned WebP derivatives. There are no external font requests, runtime services, paid integrations, or production dependencies.

## Factual corrections

| Original content                                                                   | Revised treatment                                                                                                                                              |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Battery-Free Energy” and “generates electricity”                                  | Micro-hydro is exploratory; battery storage is compatible; feasibility, environmental assessment, and applicable approvals are required before implementation. |
| “nonprofit prototype,” protected floodplain, government/environmental partnerships | Unverified legal, land-status, and partnership assertions removed.                                                                                             |
| “actively applying” and “Current Programs We're Applying To”                       | Public research resources and proposed support priorities; no confirmed awards, applications, or eligibility.                                                  |
| Retreat and infrastructure imagery implying an existing destination                | Buildings and energy equipment omitted; nature images explicitly illustrative.                                                                                 |
| Submit button without form handling                                                | Form removed; no enquiry submission is offered or claimed.                                                                                                     |
| “New Edan” presented as a working prototype                                        | Clearly framed as a long-term aspiration.                                                                                                                      |

## Verification

The local dry run covers all five pages at five widths, desktop/mobile axe scans, expanded-menu accessibility, keyboard and Escape navigation, skip links, no-JavaScript navigation, reduced motion, 200% zoom-equivalent reflow, internal links, image decoding, and absence of browser errors or third-party runtime requests.

HTML validation, formatting, browser tests, Lighthouse results, before/after screenshots, and an external-link check are included in the accompanying local review package. Lighthouse is a local simulation, not production telemetry. Automated checks supplement visual and keyboard review; they do not establish full accessibility conformance.

The browser suite passed 31 checks after the purpose and mobile refinements below. Desktop/mobile axe scans and the expanded-menu scan reported zero violations. HTML validation and formatting checks passed. Final simulated-mobile Lighthouse results:

| Page         | Performance | Accessibility | Best practices | SEO | Layout shift |
| ------------ | ----------- | ------------- | -------------- | --- | ------------ |
| Home         | 99          | 100           | 100            | 100 | 0            |
| About        | 100         | 100           | 100            | 100 | 0            |
| Vision       | 100         | 100           | 100            | 100 | 0            |
| Partnerships | 100         | 100           | 100            | 100 | 0            |
| Contact      | 100         | 100           | 100            | 100 | 0            |

The original GitHub project and federal resource returned HTTP 200. Ontario's existing programme resource returned HTTP 403 to automated retrieval and requires manual verification. Both HTTP and HTTPS `tehcland.ca` requests were observed forwarding to the original GitHub Pages site. No DNS or hosting changes were made.

## Authorization and handoff

The original remote is `https://github.com/Tehcland/tehcland.github.io.git`. Repository write access and the ChatGPT Codex Connector installation have been authorized for this repository. No alternative repository or fork has been created.

The branch is pushed as `redesign/ecological-community`. [Draft PR #1](https://github.com/Tehcland/tehcland.github.io/pull/1) targets `main` in the original repository. The local review package includes the branch bundle, a patch, screenshots, raw test evidence, and the PR description. Leave merging and publication for Ihor's approval.

The original tested implementation is commit `b5c9f6d`. The existing PR also contains the purpose and mobile refinements below; use the PR head for the current website.

## Purpose and mobile refinements

The green-and-cream design, leaf mark, typography, image selection, and five-page structure are retained. The mobile header uses a larger TEHCLAND wordmark without the tiny descriptor; the descriptor is larger on desktop and in the footer. Brand and menu alignment is checked at 320, 390, and 480 pixels.

The homepage and About page connect native planting, pollinator habitat, waterway care, practical outdoor learning, and a proposed gathering space attentive to neurodivergent people's needs. Planning and continuity records informed this wording. Historical fundraising assertions are not evidence of current grant awards or eligibility; no legal, property-status, clinical, or operating-facility claims have been added. The ambiguous “Est. 2025” label is removed because the verified date establishes the website's origin rather than the project's founding.

“Get involved” is removed throughout. Main calls to action now open project or partnership priorities. Navigation says Contact, whose page states enquiries are unavailable and offers a useful route back to the proposals. GitHub is explicitly the website source and history, not an enquiry inbox. Tests exercise the new contact-page destination and guard against reintroducing unsupported invitations.

Updated desktop/mobile screenshots and raw browser/Lighthouse results are in the local review package's refinement section. These refinements remain in draft PR #1; they do not authorize release.

## Sonara artwork and approved release

Ihor subsequently explicitly approved adding the two supplied images and publishing this website revision. A Sonara music-and-visuals section has been added to the existing homepage, with Music navigation across the five pages and a link to the verified public TEHCLAND artist page on Suno. No new project, player backend, paid service, or DNS change is included.

The supplied emblem and eye/seedpod artwork are preserved unchanged. The detailed emblem is displayed at artwork size while the simpler site header remains readable on mobile. Relevant wording is repeated as HTML rather than relying on small lettering embedded in the images. The eye/seedpod image is described as surreal artwork and an open interpretation prompt, not a psychological test or documentary habitat photograph. No historical meaning or acronym expansion for Sonara was found in the checked records, and none is asserted.

A visual scale check rendered the same emblem at 32, 48, 96, 240, and 400 CSS pixels. Fine lettering and rays become indistinct at small sizes; this supports using it as section artwork rather than a full header lockup. The supplied tagline appears to omit a letter in “Regeneration”; the HTML caption spells it correctly while retaining the original image. A future simplified mark and corrected source artwork would improve small-format use. This is a design/legibility assessment, not an audience study or a claim of measured brand preference.

The final pre-release run passed all 31 browser checks, HTML validation, and formatting. Desktop/mobile axe scans reported no violations; Lighthouse scores remain as shown above, with zero measured layout shift. Both supplied image hashes match their originals. Publication must be verified independently against the deployed Pages revision after merging.
