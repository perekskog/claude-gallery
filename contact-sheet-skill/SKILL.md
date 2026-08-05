---
name: contact-sheet
description: Generate a self-contained HTML "contact sheet" page that displays every image in a folder at once, in random order, with a drag-to-magnify preview interaction. Two selectable layouts: "grid" (every photo tiled to fit the screen with no scrolling) and "border" (thumbnails ring the screen edge, framing a central viewer panel). Use this whenever the user wants a photo contact sheet, an overview/grid page of a folder of images, a randomized image gallery, a "show me all my photos at once" page, or any single-page HTML view of a batch of images — even if they don't say "contact sheet" explicitly (e.g. "make a page with all these pictures on it", "grid of all the jpgs in this folder", "overview of my export"). Make sure to trigger this for requests to view/browse a folder of photos in the browser, not just literal contact-sheet requests.
---

# Contact Sheet Generator

## What this produces

A single, dependency-free HTML file that:

1. Shows **every image in a folder simultaneously** — the whole point is to see the whole set at a glance, with no scrolling.
2. **Randomizes the order on every page load** (not just once at generation time — reloading the page reshuffles).
3. Lets the user **magnify one photo at a time without leaving the overview**, using the same press-and-drag gesture on both touch and mouse:
   - **Mobile (touch/pen):** sliding a finger across the thumbnails shows an enlarged version of whichever photo is currently under the finger.
   - **Desktop (mouse):** clicking and holding the mouse button, then dragging across the thumbnails, does the same thing — enlarges whatever thumbnail is under the cursor while the button is held. This mirrors the touch gesture 1:1 so the same mental model works on both input types.
   - Implementation uses the Pointer Events API (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) rather than separate `touch*`/`mouse*` listeners, so touch, mouse, and pen all get identical behavior from one code path with no synthetic-event edge cases.

Two selectable layouts share this same interaction model:

- **`grid`** (default) — every photo tiled into a grid sized so nothing is cut off; magnifying shows a full-screen overlay that hides the grid while held, revealing it again on release. The grid itself is what's visible on load, not the overlay — a starting-image variant was tried (see below) but reverted because it hid the very thing the onboarding hint refers to.
- **`border`** — thumbnails ring the screen edge (top/right/bottom/left strips) framing a fixed central viewer panel; magnifying updates the viewer in place instead of overlaying anything, and since the border thumbnails stay visible the whole time, releasing just leaves the last-previewed photo showing in the viewer rather than hiding it. The viewer defaults to the first (already-shuffled) photo on load — this is fine here because the border thumbnails stay visible alongside it, unlike grid's overlay which covers them.

**Why grid and border differ on showing a starting image:** an earlier version pre-activated grid's overlay with a starting photo too, for parity with border. That broke the onboarding hint, though — the hint tells the user "let go to see all photos," but with the overlay already covering the grid, there were no visible photos yet to reveal, and new users had no way to know a grid existed at all. Border's starting image doesn't have this problem because its thumbnails are never hidden by anything. If you're tempted to re-add a grid starting image, make sure the grid (or at least a hint of it) stays visible too — parity between layouts matters less than each one actually making sense on its own.

## Onboarding hint

Real users didn't discover the drag gesture on their own — early feedback was that people simply didn't know they could browse, let alone how. Both templates show a dismissible hint (`#hint`) on load explaining the gesture in plain language ("Press & drag a photo to preview it" for grid, "Press & drag the border to browse" for border). It went through two rounds of restyling based on feedback: first a small pill (too easy to miss against a photo), then a banner hanging from the top edge (still not attention-grabbing enough). It now sits **dead center, on top of the photo** (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`) with a **solid black background and a subtle border** — deliberately opaque rather than blended/translucent, so it reads as a distinct box regardless of what's showing underneath it. If you ever restyle this, keep both properties: centered over the content (not tucked at an edge) and a genuinely solid, high-contrast background (not a translucent pill) — both were explicitly called out as the problem with earlier versions.

It deliberately does **not** dismiss on bare `pointerdown` — an earlier version did, and that meant a user could touch the screen, see the hint vanish, and still not understand anything if their press didn't land on a thumbnail or they let go without moving. Instead, each layout dismisses the hint only once the user actually succeeds at showing a *different* photo than whatever was already showing (grid: any successful preview, since nothing is shown by default; border: a switch away from the starting photo) — proof they've actually learned the gesture, not just that they touched something. A 5-second timeout is still the fallback for anyone who never interacts at all. If you add a third layout, give it an equivalent hint tailored to wherever *that* layout's interactive area actually is, dismissed on the same "actually switched" condition — don't skip it; that's the exact gap that prompted this.

Ask the user which layout they want if it's not obvious from the request; default to `grid` if they have no preference. Both can be generated for the same folder side by side (they get different default filenames).

## How to build it

Don't hand-roll this from scratch — use the bundled script, which handles image discovery, shuffling logic, and the fit-to-screen layout math consistently:

```bash
python scripts/generate_contact_sheet.py <image_folder> [-o OUTPUT] [-t "Page Title"] [-l grid|border]
```

- `<image_folder>`: the folder containing the images. By default the output HTML is written **inside that same folder** — `contact-sheet.html` for the `grid` layout, `contact-sheet-border.html` for the `border` layout — this matters because the page references images by relative filename (`src="IMG_1234.jpg"`), so the HTML must live alongside the images to load them. If the user wants the file elsewhere, either pass `-o` and then copy/move the images too, or copy the generated HTML into the image folder afterward.
- `-l/--layout`: `grid` (default) or `border`. See above for the difference.
- The script scans for `.jpg .jpeg .png .gif .webp .bmp .tif .tiff .heic` (case-insensitive) and ignores everything else (sidecar files like `.on1`, `.xmp`, thumbnails, etc. are automatically excluded).
- Re-running the script regenerates the file list — safe to re-run any time images are added or removed from the folder.

After generating, open the file (or tell the user where it is) so they can verify it in a browser before considering the task done.

## Why the layout math matters

**Grid layout:** Fitting N images on screen with no scrolling isn't a fixed column count — the right number of columns depends on the image count and the viewport's aspect ratio. The template computes this client-side on load and on resize/orientation-change: it searches column counts from 1 to N, and for each picks `rows = ceil(N / cols)`, then scores that layout by `min(viewportWidth / cols, viewportHeight / rows)` — the size of the limiting dimension of a thumbnail. It picks the column count that maximizes that score, so thumbnails are as large as possible while everything still fits.

**Border layout:** the same idea, extended to a variable number of strips instead of one uniform grid — variable because, unlike the grid layout, *which sides are even in play* is itself decided based on N before any thickness math happens:

- `chooseActiveSides(W, H, n)` decides how many of the four sides get used at all: right only, right+left, right+left+top, or the full frame (all four). It does this by actually solving each candidate (via `solveFrame`, below) and checking the real resulting per-side counts, growing from 1 side up and stopping as soon as adding the next side would leave any active side below `MIN_PER_SIDE` (5) photos. A fixed count-based formula isn't reliable here because `distribute()` splits photos by each side's *length* — top/bottom get the full width W, left/right only get whatever inner height is left — so which side ends up starved depends on the viewport's proportions, not photo count alone. For example 7 photos across right+left+top can leave top with just 1 (spanning the full width), even though 7 "sounds like enough" for 3 sides — only actually solving each candidate catches that. Right and left are tried first because a photo forced to span a side's *entire* length only has to be tall on a vertical side, whereas on a horizontal (top/bottom) side it's cropped into a razor-thin strip — much worse. This whole mechanism exists because with very few photos spread across all four sides, some side inevitably ends up with just one photo spanning its full length; concentrating photos onto fewer sides instead keeps every thumbnail a reasonable, recognizable crop.

  `MIN_PER_SIDE` has been tuned conservatively (started at 2, then 3, now 5) based on direct user feedback that a 9-photo folder — a completely normal size for this skill — should still read as the reduced single-side layout, not flip to more sides just because each one could technically be fed a couple of photos. In the default portrait viewport (`PHONE_ASPECT`), 5 works out to roughly: 1-9 photos → right only, 10-18 → right+left, 19-23 → right+left+top, 24+ → the full frame — but treat these as illustrative, not exact, since the real cutoffs come from `chooseActiveSides` actually solving each candidate, not a lookup table. If a future request wants this even more conservative (or less), it's the one constant to change.
- `solveFrame(activeSides, W, H, n)` then does what the border layout has always done, just restricted to whichever sides `activeSidesFor` chose: it searches candidate border thicknesses `s`, and for each one splits N images across only the active strips proportionally to each strip's length (largest-remainder rounding so counts sum to exactly N), scoring that thickness by the smallest resulting thumbnail dimension on any active side. It picks the `s` that maximizes that score, capped at ~16% of the screen's shorter side (same reasoning as before: without the cap, a handful of photos have so much slack that `s` would grow toward half the screen, ballooning thumbnails and squeezing the viewer to nothing).

Inactive sides collapse to a 0px grid track (via `hasTop`/`hasBottom`/`hasLeft`/`hasRight` in `layoutFrame()`), so the viewer simply expands into the space a deactivated side isn't using, rather than leaving an empty black strip.

Both run in JS in the browser (not in the Python script), so the layout also self-corrects if the browser window is resized.

## Files in this skill

- `scripts/generate_contact_sheet.py` — discovers images and renders the chosen template; this is the only script you need to run.
- `assets/template.html` — the `grid` layout template.
- `assets/template-border.html` — the `border` layout template.
- Both templates have the same two placeholders the script fills in: `__TITLE__` and `__FILES_JSON__` (a JSON array of filenames). If the user asks for a visual tweak (different gap, background color, transition, etc.), edit the relevant template directly rather than generating one-off HTML — that way the fix applies the next time the skill runs too.

## Notes / edge cases

- **Mobile Safari viewport bug:** don't size the layout with CSS `100vh`/`100vw` alone. Mobile Safari calculates `100vh` as if the address bar were hidden, which is taller than what's actually visible on first load — the layout overflows, and since scrolling is disabled, content ends up clipped with no way to reach it (Chrome/Brave don't have this issue, only Safari). Both templates work around this by sizing their root element (`#grid` or `#frame`) in JS from `window.visualViewport` (falling back to `window.innerWidth`/`innerHeight`), re-running on `resize`, `orientationchange`, and `visualViewport`'s own `resize` event, and pinning it with `position: fixed; top: 0; left: 0`. If you ever rewrite either layout's logic, keep this visual-viewport sizing — reverting to plain `100vh` reintroduces the clipped-content bug on iPhones.
- If the folder has zero recognized images, the script exits with an error rather than producing an empty page.
- Very large images will be loaded at full resolution as `<img>` sources — fine for typical photo exports, but if the user has hundreds of very large originals and mentions slow loading, offer to downscale/re-encode thumbnails separately rather than changing the interaction model.
- The interaction uses Pointer Events on the layout's root element, so the one HTML file works correctly whether opened on a phone or a desktop browser without any user-agent sniffing.
- **Border layout with very few images:** handled by `chooseActiveSides()` (see above) rather than left to chance. In the default portrait viewport it typically works out to: 1-9 photos → right only, 10-18 → right+left, 19-23 → right+left+top, 24+ → the full frame, with the exact cutoffs shifting slightly depending on viewport proportions since the decision is based on actually solving each candidate, not a fixed photo-count table. `solveFrame()` is only ever asked to place photos on sides that are actually active, so a side never silently ends up with a photo spanning its full length uncontested.
- **Portrait-phone viewport constraint:** both templates confine the whole page to a portrait, phone-shaped rectangle (`PHONE_ASPECT`, contain-fit inside the actual browser window and centered) rather than using the full window. This matters because source photos are typically portrait (shot on a phone) — on a desktop browser, which is usually landscape, laying the grid/frame out across the full window would surround every magnified photo with black letterboxing on the sides. Confining to a phone-shaped rect removes that. On an actual phone in portrait mode this constraint is a near no-op, since the real window is already close to that ratio.
  - `PHONE_ASPECT` is set to `9/16` (≈0.5625), not the raw device screen ratio (~9/19.5). The reasoning: a phone's *screen* is ~9:19.5, but the address bar and bottom toolbar/home-indicator crop into that in practice, so what a mobile visitor actually sees — and what the page already sizes itself to on a real phone via `visualViewport` — is closer to 9:16. Using the raw device ratio would simulate a taller/narrower rect on desktop than real phones actually show, wasting more screen space than necessary.
  - If the user wants a different simulated ratio (squarer, taller, or to disable the constraint and just use the full window), adjust or remove `PHONE_ASPECT` near the top of each template's `<script>` — it's the single source of truth in both files.
