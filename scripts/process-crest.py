"""Remove solid white or black background from Uganda coat of arms PNG."""
from PIL import Image, ImageDraw

SRC = r"scripts/uganda-coat-of-arms-source.png"
OUT = r"public/images/government/uganda-coat-of-arms.png"

img = Image.open(SRC).convert("RGBA")
w, h = img.size

corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
brightness = []
for xy in corners:
    r, g, b, _ = img.getpixel(xy)
    brightness.append((r + g + b) / 3)
avg = sum(brightness) / len(brightness)
light_bg = avg > 180

def should_flood(xy):
    r, g, b, _ = img.getpixel(xy)
    if light_bg:
        return r > 228 and g > 228 and b > 228
    return r < 40 and g < 40 and b < 40

def flood_if_bg(xy):
    if should_flood(xy):
        ImageDraw.floodfill(img, xy, (0, 0, 0, 0), thresh=42)

for x in range(0, w, max(1, w // 24)):
    flood_if_bg((x, 0))
    flood_if_bg((x, h - 1))
for y in range(0, h, max(1, h // 24)):
    flood_if_bg((0, y))
    flood_if_bg((w - 1, y))

bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

pad = 6
canvas = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
canvas.paste(img, (pad, pad), img)
canvas.save(OUT, optimize=True)
print("saved", OUT, canvas.size, "light_bg" if light_bg else "dark_bg")
