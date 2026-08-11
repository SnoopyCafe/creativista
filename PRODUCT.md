# Product

## Register

brand

## Users

Parents in South Florida (Plantation and surrounding) with children ages 5 to 12. Many are weighing a tutoring decision after a specific trigger: a child falling behind in reading or math, a child who has started saying "I'm bad at this", or a homeschooling parent who needs structure they can't build alone. A meaningful share arrive via the Step-Up for Students scholarship, so cost and approved-provider status are live concerns.

They are evaluating, not browsing. The job to be done is: decide within a few minutes whether this is credible, safe, affordable, and different from the franchise tutoring centre down the road — then book a call.

## Product Purpose

A single-page marketing site for Creativista Learning's tutoring pods. It replaced a Canva Sites page that could not emit headings, alt text, landmarks, `srcset`, `tel:` links, or reduced-motion rules.

Success is a booked intro call. Everything on the page serves that one conversion, and the page must earn it by being concrete rather than persuasive.

## Brand Personality

Plain-spoken, specific, warm.

The voice states facts and lets them do the persuading: "Six children, capped." "Two focused hours." "Plans, not worksheets." "We bring the teacher to you." Warmth comes from specificity and from respecting parents as the adults making the decision — never from adjectives, exclamation marks, or talking about children as if the parent weren't reading.

Numbers are load-bearing. Where a claim can be a number, it is one.

## Anti-references

- **Corporate tutoring chains** (Kumon, Sylvan, Mathnasium). Franchise signage, stock smiles, worksheet-factory feel. The site's own copy already argues against this with "Plans, not worksheets."
- **Generic SaaS landing pages.** Gradient hero, three identical feature cards, big-number stat row, purple-blue palette. Reads as a software startup, not a person who will teach your child.
- **Institutional school websites.** District-portal navy and grey, dense navigation, PDF links, notice boards. Cold and bureaucratic — the opposite of six children at one table.
- **Twee kids-craft clipart.** Crayon fonts, primary-colour confetti, cartoon pencils. Talks down to the parents who are actually paying and choosing.

## Design Principles

1. **Specificity is the persuasion.** A capped number, a named hour range, a written summary after every session. Concrete detail outperforms warm adjectives with a parent who is comparing options.
2. **The parent is the reader, the child is the subject.** Copy addresses an adult making a careful decision. Never cute, never condescending.
3. **Small is the product, so show small.** Six around one table, a teacher leaning in. Imagery and layout should feel intimate rather than institutional — the scale IS the differentiator.
4. **Trust is structural, not decorative.** Insurance, fingerprinting, background checks, Step-Up approval and a real phone number are load-bearing content, not badges to sprinkle.
5. **Never claim what isn't true yet.** Placeholders stay visibly marked until the owner supplies real prices, a real teacher name, and real reviews. Invented testimonials are both an FTC violation and a betrayal of principle 1.

## Accessibility & Inclusion

Non-negotiable, carried over from PLAN.md where it was a P0 from the original critique:

- Exactly one `<h1>`, `<h2>` per section, `<h3>` per card. No skipped levels.
- Full landmark set: `<header>`, `<nav aria-label="Main">`, `<main>`, `<footer>`.
- Meaningful `alt` on every image; `aria-hidden="true"` on every decorative SVG; `aria-label` on both social links.
- Visible-on-focus skip link to `#main` as the first focusable element.
- Visible `:focus-visible` ring on every interactive element, not clipped by any `overflow`.
- Contrast ≥4.5:1 body text, ≥3:1 large text. Fix failures by darkening the ink, never by lightening the brand colour.
- **Reduced motion inversion must be preserved exactly:** all motion is gated behind `@media (prefers-reduced-motion: no-preference)` and `.reveal` defaults to `opacity:1`. Content must be fully visible with animations disabled and in a headless renderer.
- Touch targets 44px minimum for any link that exists in only one place on the page.

Inclusion note: site photography should reflect the South Florida families actually served rather than defaulting to a single demographic.
