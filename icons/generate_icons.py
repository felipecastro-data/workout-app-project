"""
Renders the app icon PNGs from the hand-authored SVG designs (icon.svg,
icon-maskable.svg) in this folder.

No SVG rasterizer (cairosvg/rsvg-convert/Inkscape) is available in this
environment, so this redraws the identical geometry directly with Pillow
at 4x supersampling and downsamples for crisp edges. If the SVGs are
edited, update the coordinates below to match.
"""

from PIL import Image, ImageDraw

SS = 4  # supersampling factor
BASE = 512
SIZE = BASE * SS

BG_COLOR = "#1A1A1E"
BLUE = "#3B82F6"
LIGHT = "#F5F5F7"

# Glyph geometry (matches icons/icon.svg and icons/icon-maskable.svg), scaled by SS.
PLATE_W, PLATE_H, PLATE_R = 70 * SS, 110 * SS, 18 * SS
HANDLE_W, HANDLE_H, HANDLE_R = 140 * SS, 28 * SS, 14 * SS
CENTER = (BASE * SS // 2, BASE * SS // 2)
PLATE1_XY = (116 * SS, 201 * SS)
PLATE2_XY = (326 * SS, 201 * SS)
HANDLE_XY = (186 * SS, 242 * SS)


def draw_glyph():
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    x, y = PLATE1_XY
    draw.rounded_rectangle([x, y, x + PLATE_W, y + PLATE_H], radius=PLATE_R, fill=BLUE)

    x, y = PLATE2_XY
    draw.rounded_rectangle([x, y, x + PLATE_W, y + PLATE_H], radius=PLATE_R, fill=BLUE)

    x, y = HANDLE_XY
    draw.rounded_rectangle([x, y, x + HANDLE_W, y + HANDLE_H], radius=HANDLE_R, fill=LIGHT)

    layer = layer.rotate(-45, resample=Image.BICUBIC, center=CENTER)
    return layer


def render_rounded_icon():
    """Rounded-square background, transparent corners — standard manifest icons."""
    bg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(bg)
    draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=112 * SS, fill=BG_COLOR)
    bg.alpha_composite(draw_glyph())
    return bg


def render_square_icon():
    """Full-bleed square background, opaque — apple-touch-icon + maskable."""
    bg = Image.new("RGBA", (SIZE, SIZE), BG_COLOR)
    bg.alpha_composite(draw_glyph())
    return bg.convert("RGB")


def save_resized(img, path, size):
    img.resize((size, size), Image.LANCZOS).save(path)
    print(f"wrote {path} ({size}x{size})")


if __name__ == "__main__":
    rounded = render_rounded_icon()
    square = render_square_icon()

    save_resized(rounded, "icon-192.png", 192)
    save_resized(rounded, "icon-512.png", 512)
    save_resized(square, "apple-touch-icon.png", 180)
    save_resized(square, "icon-512-maskable.png", 512)
