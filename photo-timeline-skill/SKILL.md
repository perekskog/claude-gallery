---
name: photo-timeline
description: Generate a self-contained HTML page that lays a folder of date-stamped photos out along a vertical timeline — a line of dots down the right edge of the screen, each positioned by that photo's capture date parsed from its filename — with a large image viewer filling the rest of the screen. Press-and-drag along the timeline scrubs through time, showing whichever photo is nearest the pointer enlarged in the viewer (same gesture as the contact-sheet skill's grid/border layouts). Use this whenever the user wants to browse a folder of photos in date/chronological order, see a "timeline" of a shoot or project, scrub through a time series of images, or otherwise wants the layout driven by capture date rather than random shuffle — e.g. "show these in order over time", "timeline of this trip", "scrub through my photos by date". Contrast with the contact-sheet skill, which randomizes every photo into a grid or border with no notion of time.
---

# Photo Timeline

## What this produces

A single, dependency-free HTML file that:

1. Parses a **capture date out of each photo's filename** and sorts the set chronologically (ascending — no shuffling; a timeline only makes sense in real order).
2. Renders every photo as a **dot on a vertical line along the right edge of the screen**, positioned proportionally between the earliest (top) and latest (bottom) date in the set, so dot spacing reflects how photos actually cluster in time (a burst of photos on one day sits close together; a gap of weeks leaves visible space on the line).
3. Fills the rest of the screen with a **large viewer** showing one photo at a time, with the date of the current photo shown as a small pill-shaped overlay badge at the bottom of the viewer (semi-transparent, blurred background so it reads over any photo). If that photo has a note (see below), it appears as a second, wider caption pill directly above the date badge.
4. Lets the user **scrub through time with the same press-and-drag gesture used elsewhere in this photo-viewing family**:
   - **Mobile (touch/pen):** sliding a finger up/down the timeline shows whichever photo's dot is closest to the finger, enlarged in the viewer.
   - **Desktop (mouse):** clicking and holding, then dragging up/down the timeline, does the same thing.
   - Built on the Pointer Events API (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`), same as the contact-sheet skill.
   - Unlike the contact-sheet skill's grid/border layouts, this does **nearest-dot-by-Y** rather than hit-testing the exact element under the pointer — dots are small on purpose (there can be dozens), so exact hits would be fiddly. Releasing leaves the last-previewed photo showing; there's no separate "revealed" state to return to since the timeline is always visible (same reasoning as the border layout in the contact-sheet skill).

## Onboarding hint

Real users didn't discover the drag gesture on their own — early feedback on the contact-sheet skill's layouts was that people didn't realize they could browse at all, and the timeline is if anything a harder case: the interactive area is a thin column of small dots along the right edge, not the whole screen. On load, a dismissible hint (`#hint`) reads "Drag the timeline on the right to browse by date." It went through two rounds of restyling based on feedback: first a small pill (too easy to miss against a photo), then a banner hanging from the top edge (still not attention-grabbing enough). It now sits **dead center, on top of the photo** (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`) with a **solid black background and a subtle border** — deliberately opaque rather than blended/translucent. Don't confuse this with the pill-shaped date/note badges at the *bottom* of the viewer, which are a separate, intentionally-subtle element (see "Notes / captions" below) — the hint needs to be the opposite: centered, solid, and unmissable, since that's specifically what user feedback flagged as the problem with its earlier styling.

It deliberately does **not** dismiss on bare `pointerdown` — an earlier version did, which meant pressing down on the same dot that was already active (the starting photo) made the hint vanish without the user having learned anything, since nothing actually changed. Instead it only dismisses inside `setActive()`, and only when there was already a photo showing and the index actually changes — i.e. once the user has proven they understand dragging switches photos, not merely that they touched the screen. A 5-second timeout is still the fallback for anyone who never interacts at all. Keep this "actually switched, not just touched" condition in sync with the equivalent hints in the contact-sheet skill's templates if you change the pattern.

## How to build it

```bash
python scripts/generate_timeline.py <image_folder> [-o OUTPUT] [-t "Page Title"]
```

- `<image_folder>`: the folder containing the images. By default the output HTML is written to `timeline.html` **inside that same folder** — the page references images by relative filename, so the HTML must live alongside the images.
- The script scans for `.jpg .jpeg .png .gif .webp .bmp .tif .tiff .heic` (case-insensitive).
- Re-running the script regenerates the file list and dates — safe to re-run any time images are added or removed.

After generating, open the file (or tell the user where it is) so they can verify it in a browser before considering the task done. Check the script's printed output for a note about any files that had no parseable date (see below) — worth flagging to the user since those photos will be placed at their file's modification time instead of their actual capture date.

## Notes / captions (photo-notes.json)

Every run writes/updates `photo-notes.json` in the image folder: a flat JSON object mapping filename → note string (e.g. `{"Pe_260621_TaO_593_IMG_7444.jpg": ""}`). The first run creates it with an empty `""` note for every image. The user edits that file by hand — any text editor, fill in a sentence for whichever photos they want captioned. Notes are display-only strings (no markdown/HTML rendering) shown in a caption pill above the date badge, only when non-empty.

Important behavior to preserve if you ever touch `sync_notes()`: it only **adds** missing keys for new images, it never overwrites or removes an existing key — so a user's hand-written notes always survive a re-run, even if some photos have since been deleted from the folder (their stale note entries are just left in place, harmless, in case the photos come back). If `photo-notes.json` exists but contains invalid JSON, the script stops with an error instead of silently overwriting it — don't change that to a silent fallback, it would risk destroying edited notes.

**Notes are re-read live, not just baked in at generation time.** `generate_timeline.py` still bakes the current notes into `timeline.html` (so the page works standalone/offline, per the "dependency-free" principle), but on every page load the template's `loadFreshNotes()` also `fetch()`es `photo-notes.json` fresh and merges any changed values over the baked-in ones — updating the on-screen caption immediately if the currently displayed photo's note changed. This means: edit `photo-notes.json`, reload the page, see the new note — **no need to re-run the script** just for note changes (re-running is still required for a genuinely new/removed image, since that changes the dot layout and file list).

This live fetch can silently fail depending on the browser: opening `timeline.html` directly via `file://` blocks `fetch()` of a sibling `file://` resource in Chrome by default (Firefox generally allows it). When it fails, the page just falls back to whatever notes were baked in at last generation — nothing breaks, it just isn't live. If a user wants guaranteed live reload regardless of browser, suggest serving the folder over a trivial local server (`python3 -m http.server` in the image folder, then open `http://localhost:8000/timeline.html`) instead of double-clicking the file.

## Date parsing

`parse_date_from_filename()` in the script tries these patterns against each filename, most specific first:

1. ISO `YYYY-MM-DD` (unambiguous).
2. 8 consecutive digits read as `YYYYMMDD`.
3. 6 consecutive digits read as `YYMMDD`, year assumed 19xx/20xx (`yy < 70` → 20xx, else 19xx) — this covers filenames like `Pe_260621_TaO_593_IMG_7444.jpg`, where `260621` decodes to 2026-06-21.

If none of these find a valid date in a filename, the script falls back to that file's modification time and counts it, printing a summary line so you know how many photos (if any) are only approximately placed. If the user's naming convention doesn't match any of these patterns, extend `parse_date_from_filename` in `scripts/generate_timeline.py` rather than post-processing the output — that way it keeps working next time the skill runs.

## Why the dot-placement math matters

A naive approach (evenly space every dot regardless of date) would misrepresent the timeline — clustered photos and sparse gaps would look identical. Instead, dot Y-position starts proportional to `(photo.t - minT) / (maxT - minT)`, so real time gaps show up as visual gaps. But photos taken on the same day (or same instant) would then land exactly on top of each other and become unclickable, so a monotonic minimum-gap pass runs afterward: walk down the sorted list and push any dot that's closer than `minGap` to the previous one further down, then (if that pushed the last dot past the bottom edge) walk back up doing the same in reverse. This preserves chronological order and relative spacing wherever there's room, and only compresses toward uniform spacing where dates are tightly clustered relative to the line's pixel height. This runs in JS on load/resize, same as the contact-sheet skill's grid/border math.

## Notes / edge cases

- **Mobile Safari viewport bug:** sized from `window.visualViewport` (falling back to `window.innerWidth`/`innerHeight`), same fix and same reasoning as the contact-sheet skill's templates — don't revert to plain `100vh`.
- **Portrait-phone viewport constraint:** the whole page is confined to a portrait rect (`PHONE_ASPECT = 9/16`) contain-fit and centered inside the actual browser window, for the same reason and with the same value as the contact-sheet skill's grid/border layouts (approximates the *visible* mobile viewport after browser chrome, not the raw device screen — see that skill's notes for the full reasoning). Adjust the constant near the top of the template's `<script>` if needed.
- **All photos on (effectively) one date:** if `maxT === minT` (e.g. a single day's shoot with no time-of-day info, since dates have no time component), the proportional formula can't produce spacing, so dots fall back to even index-based spacing along the line instead of collapsing to one point.
- If the folder has zero recognized images, the script exits with an error rather than producing an empty page.
- This skill is a sibling to the contact-sheet skill (same photo-viewing interaction family, same drag gesture, same phone-viewport constraint) but deliberately a separate skill rather than a third layout option there — contact-sheet's whole premise is randomizing order to see everything at once, which is the opposite of what a timeline needs, and folding date-parsing logic into that skill's generic image-grid script would muddy both skills' triggering.
