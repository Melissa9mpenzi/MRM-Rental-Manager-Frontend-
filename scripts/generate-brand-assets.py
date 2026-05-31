"""Generate favicon and PWA icons from the RentDirect system logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "logo.png"
PUBLIC = ROOT / "public"
ASSETS = ROOT / "src" / "assets"


def crop_mark(source: Image.Image) -> Image.Image:
    """Square crop of the house/key/handshake mark (top of the full logo)."""
    w, h = source.size
    icon_h = int(h * 0.52)
    size = min(w, icon_h)
    left = (w - size) // 2
    return source.crop((left, 0, left + size, size))


def resize_square(source: Image.Image, size: int) -> Image.Image:
    return source.resize((size, size), Image.Resampling.LANCZOS)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def save_ico(mark: Image.Image, path: Path) -> None:
    sizes = [16, 32, 48]
    frames = [resize_square(mark, s) for s in sizes]
    frames[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=frames[1:],
    )


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source logo: {SOURCE}")

    logo = Image.open(SOURCE).convert("RGBA")
    mark = crop_mark(logo)

    save_png(resize_square(mark, 16), PUBLIC / "favicon-16.png")
    save_png(resize_square(mark, 32), PUBLIC / "favicon-32.png")
    save_png(resize_square(mark, 180), PUBLIC / "apple-touch-icon.png")
    save_png(resize_square(mark, 512), PUBLIC / "logo-icon.png")
    save_ico(mark, PUBLIC / "favicon.ico")

    # Keep in-app logo asset in sync with public full logo.
    full_logo = PUBLIC / "rentdirect-logo.png"
    if full_logo.exists():
        save_png(Image.open(full_logo).convert("RGBA"), ASSETS / "rentdirect-logo.png")

    print("Generated favicon assets from", SOURCE)


if __name__ == "__main__":
    main()
