---
name: landing-pages
description: Create or improve landing pages for a specific offer, audience, campaign, keyword, or ECP, and the brand homepage built from the General audience. Use when the user asks for a landing page, campaign page, offer page, vertical page, lead-capture page, homepage mockup, or conversion-focused web page. Combines positioning, persuasive page structure, page copy, trust signals, CTA hierarchy, and handoff-ready requirements for design or implementation. For general copy on an existing page, see copywriting. For CRO review of an existing page, see page-cro. For ad copy, see direct-response-copy.
metadata:
  author: Growth4U
  version: "1.5"
  system: SanchoCMO
  phase: "2"
  pillar: "content"
  layer: "Execution"
---

# Landing Pages

> Campaign-ready page strategy and copy. The goal is not a pretty page outline; the goal is a page that makes one audience understand one offer and take one action.

## Use When

- A campaign, ECP, keyword, vertical, lead magnet, or offer needs its own page.
- Paid ads, SEO, outreach, partner campaigns, or launch plans need a conversion destination.
- Existing strategy needs to become page sections, copy, proof, and implementation requirements.

Do not use this for generic website copy if there is no conversion page to plan. Use `copywriting` for broad page copy and `page-cro` for diagnosing an existing page.

## Required Inputs

Load what exists before asking questions:

- **Brand voice** (`brand/{slug}/brand-book/brand-voice/brand-voice.current.md`): how every
  line sounds, including banned words and how headlines are built.
- **Visual identity** (`brand/{slug}/brand-book/visual-identity/DESIGN.md`): colors, type,
  components and visual red lines. The page uses its tokens instead of inventing a style,
  and its red lines (for example no certification badges or star ratings) apply to the
  suggested visuals too.
- **Messages for the ECP** (Foundation `message` rows of that niche): the UVP is the hero,
  the USPs are the benefit sections in order of criterion importance, the anti-objections
  are the FAQ and the assets' existing proofs are the proof section. Start from them, adapt
  only to the traffic source, and say what you changed and why.
- Positioning for the relevant ECP or segment (objections still open, vetoes).
- Offer details: what is being promised, who it is for, and what action the page should drive.
- Traffic source: ads, SEO, email, social, outreach, partner, or direct.
- Proof available: testimonials, logos, cases, metrics, screenshots, certifications, guarantees.

If any input is missing, make a reasonable draft assumption and mark it as an assumption in the output.

## Workflow

1. Define the page job:
   - One audience.
   - One offer.
   - One primary CTA.
   - One traffic context.

2. Build the argument:
   - Visitor awareness level.
   - Primary pain or desired outcome.
   - Why the current moment matters.
   - Why this offer is different.
   - What proof reduces risk.

3. Draft the page:
   - Hero: headline, subheadline, primary CTA, trust cue.
   - Problem or opportunity section.
   - Solution or mechanism section.
   - Benefits with concrete outcomes.
   - Proof section.
   - Process or what happens next.
   - Objection handling.
   - FAQ.
   - Final CTA.

4. Prepare implementation handoff:
   - Section order.
   - Copy blocks.
   - Recommended media or visual proof.
   - Tracking events.
   - SEO metadata when relevant.

5. Link the published niche landing: after publishing it in Brand Brain at
   `brand/{slug}/go-to-market/landings/<folder>/<folder>.current.html`, set that path as
   `landingPath` on the niche's `positioning` row (`sancho_table_mutate`, `update_fields`)
   so the Positioning Explorer links it. Never leave the Explorer to guess it from folder names.

## Standard niche landing from Foundation

For niche review mockups, use the shared six-section structure: UVP → «¿Te suena?»
→ early proof → up to four USPs → objection FAQ → repeated UVP and CTA as text.
No new copy or new message type. The question lives in Objeciones; its linked
response retains the internal `anti_objection` type. Shared messages appear in
all their `nicheIds`, without copying rows. Read the CTA literally from the UVP
`message.cta`; positioning writes it with the messages. Do not invent it in the renderer
or replace it with a global CTA. Changes to that field require regenerating the mockup.

Selection rules, CRO checks and publication/readback procedure:
[niche-landing.md](skills/landing-pages/references/niche-landing.md).
Generator: `skills/landing-pages/scripts/build-niche-landings.mts`. It uses the
same renderer as the live Explorer; default is preview, `--write` publishes via MCP.

## Brand homepage from the General audience

The General audience is the buying journey of a company that wants to adopt the product:
3 to 5 buyer questions in the order the buyer asks them, each grouping several criteria,
with one brand USP per question (see
[general-audience.md](skills/positioning-messaging/references/general-audience.md)). Its
page is the brand homepage, a review mockup like the niche landings, with no buttons:

headline (brand UVP) → one block per journey question, in order → «Para quién», one card
per priority niche linking to its landing, plus a separate link to each role page →
proof → FAQ → closing (UVP and its `cta` as text).

Only priority niches appear: in the cards and in the bar, which now starts with «General».
Non-priority niches keep their landings but leave the bar and the client package.

**Role pages.** A niche is the type of company that buys; a role is who takes part in the
purchase inside any niche (IT, security, compliance). A role gets no niche landing and is
never a priority niche. It gets a role page instead («Si revisas la seguridad»): what the
buyer from any niche forwards to that person. Same mockup rules and generator as a niche
landing, fed by the role's `positioning` row while the schema has no roles. In each niche
landing, the role's criteria appear as a benefit block where they weigh 8 or more for that
niche, or as an FAQ where they weigh less.
Sources, role pages, review warnings, generator status and publication path
(`go-to-market/landings/general/general.current.html`, `landingPath` on the brand
`positioning` row): [homepage.md](skills/landing-pages/references/homepage.md).

## Niche Landings from the Message Table Are Review Mockups

When the landing is built from a niche's `message` rows, it is a mockup for the client to
review the copy in page form, not the page that goes live. The copy is still under review in
the table, so anything that sends a visitor somewhere (or looks like it could) gets in the way
of the review and risks someone treating the mockup as published.

- **No way out.** No CTA buttons and no links to the client's website, demo, signup or app.
  Where the page would have a CTA, write its copy as plain text so it can be reviewed.
- **Say what it is.** A visible line at the very top: «Maqueta para revisión».
- **Niche bar at the top.** Links to the homepage («General», first), to every priority
  niche landing and to the role pages of the brand, with the current one marked (`aria-current="page"` plus a
  visible style). Without priority niches marked, every niche landing. These are the only
  links on the page.
- **Comments.** Publish each landing in Brand Brain (step 5 path), then create one share
  link per landing with `sancho_share_create_link` (`access: "comment"`, the default, and
  `expiresInHours: 2160`, the 90-day maximum). Each share link opens a single document, so
  relative links between landings do not work for the client: the niche bar points to the
  share URLs. Order: publish all landings, create the live links, write the bars with those
  URLs and republish (a live link shows the latest version).
- **Link target.** Every bar link uses `target="_top"`: the shared and internal
  viewers allow top navigation only after user activation (SAN-1413). A script
  without a click cannot navigate the parent.
- **Expiry.** Links die after at most 90 days. Report the expiry date with the links; to
  renew, create new share links and rewrite the bars.
- Step 5 (`landingPath` on the niche's `positioning` row) still applies to every landing.

The Quality Bar still applies, except that the conversion goal and the CTA are judged as copy,
not as a working button.

## Output Format

```markdown
# Landing Page Brief — [Offer/Page Name]

## Page Strategy
- Audience:
- Traffic source:
- Awareness level:
- Primary CTA:
- Secondary CTA:
- Core promise:
- Main objection:

## Page Copy

### Hero
Headline:
Subheadline:
Primary CTA:
Trust cue:

### Section 1 — [Name]
[Copy]

### Section 2 — [Name]
[Copy]

### Proof
[Testimonials, metrics, logos, cases, or placeholder proof needed]

### FAQ
1. [Question]
   [Answer]

### Final CTA
[Copy]

## Implementation Notes
- Design tokens used (from DESIGN.md) and visual red lines respected:
- Suggested visuals:
- Tracking events:
- SEO title:
- Meta description:
- Assumptions:
- Review mockup (niche landings from messages): share URL per landing and expiry date:
```

## Quality Bar

- The page has one clear conversion goal.
- The headline says what the visitor gets, not just what the product is, in one sentence; the subheadline says how.
- One idea per block, at most two short sentences in its body; secondary details are cut.
- No plan names (Free, Starter, Growth…) and no price per plan in the headline, subheadline, blocks or FAQ. State the condition without naming the plan, or drop the claim if it is only true with the plan name.
- The copy matches the traffic source and awareness level.
- Every major claim is supported by proof or marked as needing proof.
- The CTA copy communicates value, not only action.
- The copy follows the brand voice and the page uses the DESIGN.md tokens; if either document is missing, the output says so.
- The page can be handed to design or implementation without another strategy pass.
