#!/usr/bin/env python3
"""
Generate a self-contained "contact sheet" HTML page for a folder of images.

The page shows every image in the folder in a randomized grid sized to fit
the screen without scrolling. On touch devices, sliding a finger over the
grid previews the enlarged image underneath; lifting the finger returns to
the grid. On desktop, clicking and holding the mouse button and dragging
does the same thing; releasing the button returns to the grid.

Usage:
    python generate_contact_sheet.py <image_folder> [-o OUTPUT] [-t TITLE] [-l LAYOUT]

Two layouts are available (-l/--layout):
  grid    (default) every photo tiled in a grid sized to fit the screen.
  border  thumbnails ring the screen edge, framing a central viewer panel.

The output HTML file references images by relative filename, so it must
stay in the same folder as the images (this is the default: the script
writes contact-sheet.html — or contact-sheet-border.html for the border
layout — directly into <image_folder>).
"""
import argparse
import json
import sys
from pathlib import Path

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".heic"}

SCRIPT_DIR = Path(__file__).resolve().parent
ASSETS_DIR = SCRIPT_DIR.parent / "assets"
TEMPLATES = {
    "grid": ASSETS_DIR / "template.html",
    "border": ASSETS_DIR / "template-border.html",
}


def find_images(folder: Path):
    files = sorted(
        f.name for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    )
    return files


def build_html(files, title, layout):
    template = TEMPLATES[layout].read_text(encoding="utf-8")
    html = template.replace("__TITLE__", title)
    html = html.replace("__FILES_JSON__", json.dumps(files, ensure_ascii=False, indent=2))
    return html


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("folder", help="Folder containing the images")
    parser.add_argument("-o", "--output", help="Output HTML path (default: <folder>/contact-sheet.html, or contact-sheet-border.html for the border layout)")
    parser.add_argument("-t", "--title", default="Contact Sheet", help="Page title")
    parser.add_argument(
        "-l", "--layout", choices=sorted(TEMPLATES), default="grid",
        help="'grid' (default): every photo tiled to fit the screen. "
             "'border': thumbnails ring the screen edge around a central viewer.",
    )
    args = parser.parse_args()

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        print(f"Error: {folder} is not a directory", file=sys.stderr)
        sys.exit(1)

    files = find_images(folder)
    if not files:
        print(f"Error: no images found in {folder}", file=sys.stderr)
        sys.exit(1)

    if args.output:
        output_path = Path(args.output).expanduser().resolve()
    else:
        default_name = "contact-sheet.html" if args.layout == "grid" else f"contact-sheet-{args.layout}.html"
        output_path = folder / default_name

    html = build_html(files, args.title, args.layout)
    output_path.write_text(html, encoding="utf-8")

    print(f"Found {len(files)} images.")
    print(f"Wrote {output_path}")
    if output_path.parent != folder:
        print(
            "Note: output is not in the same folder as the images. "
            "Copy it there (or adjust paths) so the relative image references resolve."
        )


if __name__ == "__main__":
    main()
