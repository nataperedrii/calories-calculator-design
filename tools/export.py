"""Export an HTML page to PNG with Playwright (headless Chromium).

Usage:
  .venv/bin/python tools/export.py <input.html> <output.png> [--width 390] [--height 844] [--scale 2] [--full-page]

Examples:
  # Branding board, full page
  .venv/bin/python tools/export.py 01-branding/directions.html 01-branding/directions.png --width 2160 --height 1200 --scale 1 --full-page
  # Mobile screen @2x (390x844 -> 780x1688)
  .venv/bin/python tools/export.py 03-screens/screens/home.html 03-screens/exports/home.png
"""
import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--width", type=int, default=390)
    p.add_argument("--height", type=int, default=844)
    p.add_argument("--scale", type=float, default=2)
    p.add_argument("--full-page", action="store_true")
    args = p.parse_args()

    url = Path(args.input).resolve().as_uri()
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=args.scale,
        )
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.screenshot(path=str(out), full_page=args.full_page)
        browser.close()
    print(f"Saved {out}")


if __name__ == "__main__":
    main()
