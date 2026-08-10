# Creativista Learning static website

This is a plain HTML/CSS website with no build step and no runtime package dependencies.

## Preview locally

From the repository root, run:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

Run the dependency-free production checks with:

```sh
node tools/check.mjs
```

## Before launch

- Replace every visible `.ph` placeholder in `index.html` and resolve the adjacent `TODO(owner)` comment. These cover the three program prices, teacher name and credential, the `15+ years` claim, and three testimonials with parent name and child's age.
- Confirm that `info@creativistalearning.org` exists before publishing.
- To change the Square Appointments destination, find `BOOKING_URL` near the top of `index.html`, then replace the same literal URL everywhere in that file.

## Deploy

Create a clean release folder containing `index.html`, `css/`, the top-level optimized files in `images/`, `favicon.svg`, and `robots.txt`. Do not include `reference/`, `tools/`, or `images/_src/`; those are development sources only.

The release folder can be dragged into Netlify, or deployed from inside that folder with:

```sh
vercel deploy
```

No build command is required.
