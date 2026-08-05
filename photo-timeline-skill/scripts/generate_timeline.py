#!/usr/bin/env python3
"""
Generate a self-contained "photo timeline" HTML page for a folder of
date-stamped images.

Every photo appears as a dot on a vertical timeline along the right edge
of the screen, positioned by its capture date (parsed from the filename).
A large viewer fills the rest of the screen. On touch devices, sliding a
finger up/down the timeline scrubs through time, showing whichever photo
is nearest the finger enlarged in the viewer; on desktop, clicking and
holding the mouse button and dragging does the same thing. This mirrors
the drag-to-preview gesture used by the contact-sheet skill's grid/border
layouts, just driven by date position instead of grid position.

Each image can also carry a short note/description, shown as a caption
above the date badge when that photo is displayed. Notes live in a sidecar
JSON file — photo-notes.json — written into the image folder alongside
timeline.html. The first run creates it with an empty "" note for every
image; edit that file by hand (any text editor) to fill in descriptions,
then re-run this script to bake the updated notes into the HTML. Re-running
never overwrites notes you've already written — it only adds entries for
images that are new since the last run.

Usage:
    python generate_timeline.py <image_folder> [-o OUTPUT] [-t TITLE]

The output HTML file references images by relative filename, so it must
stay in the same folder as the images (this is the default: the script
writes timeline.html directly into <image_folder>).
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".heic"}
METADATA_FILENAME = "photo-notes.json"

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = SCRIPT_DIR.parent / "assets" / "template.html"

# Tried in order against the filename. Each returns (year, month, day) or
# raises/returns None if the match doesn't look like a real date.
_ISO_RE = re.compile(r"(\d{4})-(\d{2})-(\d{2})")
_YYYYMMDD_RE = re.compile(r"(?<!\d)(\d{8})(?!\d)")
_YYMMDD_RE = re.compile(r"(?<!\d)(\d{6})(?!\d)")


def _valid_ymd(y, mo, d):
    if not (1990 <= y <= 2100 and 1 <= mo <= 12 and 1 <= d <= 31):
        return None
    try:
        return datetime(y, mo, d)
    except ValueError:
        return None


def parse_date_from_filename(name: str):
    """Look for an embedded date in a filename, trying the most specific /
    least ambiguous patterns first:
      1. ISO YYYY-MM-DD (unambiguous)
      2. 8 consecutive digits read as YYYYMMDD
      3. 6 consecutive digits read as YYMMDD (year assumed 19xx/20xx),
         e.g. this user's "Pe_260621_TaO_593_IMG_7444.jpg" convention
    Returns a datetime or None if nothing plausible was found.
    """
    m = _ISO_RE.search(name)
    if m:
        dt = _valid_ymd(int(m[1]), int(m[2]), int(m[3]))
        if dt:
            return dt

    for m in _YYYYMMDD_RE.finditer(name):
        s = m[1]
        dt = _valid_ymd(int(s[0:4]), int(s[4:6]), int(s[6:8]))
        if dt:
            return dt

    for m in _YYMMDD_RE.finditer(name):
        s = m[1]
        yy = int(s[0:2])
        year = 2000 + yy if yy < 70 else 1900 + yy
        dt = _valid_ymd(year, int(s[2:4]), int(s[4:6]))
        if dt:
            return dt

    return None


def find_images(folder: Path):
    return sorted(
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    )


def sync_notes(folder: Path, image_names):
    """Load photo-notes.json (filename -> note string), add an empty entry
    for any image that isn't in it yet, and write it back if anything
    changed. Never touches existing note values, so hand-edited
    descriptions always survive a re-run."""
    path = folder / METADATA_FILENAME
    notes = {}
    if path.exists():
        try:
            notes = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"Error: {path.name} is not valid JSON ({e}). Fix it and re-run.", file=sys.stderr)
            sys.exit(1)
        if not isinstance(notes, dict):
            print(f"Error: {path.name} must be a JSON object mapping filename -> note.", file=sys.stderr)
            sys.exit(1)

    added = 0
    for name in image_names:
        if name not in notes:
            notes[name] = ""
            added += 1

    if added or not path.exists():
        path.write_text(
            json.dumps(notes, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    return notes, added


def build_photo_list(folder: Path, notes: dict):
    photos = []
    fallback_count = 0
    for f in find_images(folder):
        dt = parse_date_from_filename(f.name)
        if dt is None:
            fallback_count += 1
            dt = datetime.fromtimestamp(f.stat().st_mtime)
        photos.append({
            "file": f.name,
            "t": int(dt.timestamp() * 1000),
            "note": notes.get(f.name, "") or "",
        })
    photos.sort(key=lambda p: p["t"])
    return photos, fallback_count


def build_html(photos, title):
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = template.replace("__TITLE__", title)
    html = html.replace("__PHOTOS_JSON__", json.dumps(photos, ensure_ascii=False, indent=2))
    return html


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("folder", help="Folder containing the images")
    parser.add_argument("-o", "--output", help="Output HTML path (default: <folder>/timeline.html)")
    parser.add_argument("-t", "--title", default="Timeline", help="Page title")
    args = parser.parse_args()

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        print(f"Error: {folder} is not a directory", file=sys.stderr)
        sys.exit(1)

    image_files = find_images(folder)
    if not image_files:
        print(f"Error: no images found in {folder}", file=sys.stderr)
        sys.exit(1)

    notes, added_notes = sync_notes(folder, [f.name for f in image_files])
    photos, fallback_count = build_photo_list(folder, notes)

    output_path = Path(args.output).expanduser().resolve() if args.output else folder / "timeline.html"
    html = build_html(photos, args.title)
    output_path.write_text(html, encoding="utf-8")

    print(f"Found {len(photos)} images.")
    if fallback_count:
        print(
            f"Note: {fallback_count} file(s) had no parseable date in their filename; "
            "used file modification time instead."
        )
    if added_notes:
        print(
            f"Added {added_notes} new entr{'y' if added_notes == 1 else 'ies'} to "
            f"{METADATA_FILENAME} (empty notes) — edit that file to add descriptions, "
            "then re-run this script to bake them into the page."
        )
    print(f"Wrote {output_path}")
    if output_path.parent != folder:
        print(
            "Note: output is not in the same folder as the images. "
            "Copy it there (or adjust paths) so the relative image references resolve."
        )


if __name__ == "__main__":
    main()
