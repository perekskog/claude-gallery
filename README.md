# Photo galleries: contact-sheet & photo-timeline

Two standalone, dependency-free HTML skills for browsing a folder of
photos. `contact-sheet` shows all photos at once — shuffled order for the
grid layout, filename order for the border layout; `photo-timeline`
browses chronologically based on the capture date extracted from each
filename. Both share the same press-and-drag gesture (Pointer Events) and
simulated portrait viewport.

Full requirements, design rationale, and known trade-offs:
[docs/description.md](docs/description.md) (kept up to date as
requirements evolve).

## Idea

An alternative to hunting for and installing an off-the-shelf photo
gallery library or template: instead, generate a gallery from scratch,
purpose-built for the specific kind of photo set and browsing need at
hand.

- **contact-sheet** is for phone-shot portrait photos: the grid layout has
  no meaningful order to preserve, so it shuffles on every load, while the
  border layout keeps a stable filename order for a revisitable browsing
  sequence. Both are optimized to show as many photos as possible at once
  without favoring any single one.
- **photo-timeline** is for photos where *when* they were taken is the
  meaningful dimension — it parses a specific filename convention to
  extract capture dates and lays the photos out chronologically, with
  clusters and gaps visible.

An off-the-shelf gallery comes with a generic, configurable UI that has to
cover every use case at once, and still needs bending to fit a particular
dataset. Generating the gallery instead means the layout and interaction
can be exactly right for the photos it's for from the start, while the
portrait viewport and press-and-drag gesture stay shared building blocks
reused across both.

## Usage

```bash
python contact-sheet-skill/scripts/generate_contact_sheet.py <photo-folder> [-o OUTPUT] [-t TITLE] [-l grid|border]
python photo-timeline-skill/scripts/generate_timeline.py <photo-folder> [-o OUTPUT] [-t TITLE]
```

Each script generates a standalone HTML file (default: `contact-sheet.html`
/ `contact-sheet-border.html`, or `timeline.html`) directly in the photo
folder — it must stay there, since the photos are referenced by relative
path.

## Structure

- `contact-sheet-skill/` — `SKILL.md`, `scripts/generate_contact_sheet.py`,
  `assets/template.html` (grid) + `assets/template-border.html` (border)
- `photo-timeline-skill/` — `SKILL.md`, `scripts/generate_timeline.py`,
  `assets/template.html`

See each `SKILL.md` for trigger description and skill-specific details;
[docs/description.md](docs/description.md) covers the whole picture and
the design decisions behind it.

## Packaging

Skills are developed here as editable source but must be packaged
(skill-creator's `package_skill.py` → `.skill` zip, "Save skill") and
installed separately to show up as real, invocable skills — editing the
files here does not automatically update an already-installed skill.
`photo-timeline` was packaged and installed early in the process;
`contact-sheet` hasn't been reinstalled since and is likely out of date
compared to the source here. Reinstalling both is planned but not urgent.
