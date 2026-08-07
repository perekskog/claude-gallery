# Photo galleries: contact-sheet & photo-timeline

Two standalone, dependency-free HTML skills for browsing a folder of
photos. `contact-sheet` shows all photos at once in shuffled order (grid
or border layout); `photo-timeline` browses chronologically based on the
capture date extracted from each filename. Both share the same
press-and-drag gesture (Pointer Events) and simulated portrait viewport.

Full requirements, design rationale, and known trade-offs:
[docs/description.md](docs/description.md) (kept up to date as
requirements evolve).

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
