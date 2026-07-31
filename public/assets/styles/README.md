# Style photography drop-in

Every card in the studio catalog renders an illustrated vector portrait by
default (`src/components/StylePreview.jsx`). That keeps all sixty-odd previews
sharp, identically framed and consistent with each other without shipping sixty
photographs.

To replace any of them with real studio photography:

1. Drop the file in this folder, named after the style id from
   `src/data/catalog.js`. For example `curtain-bangs.jpg`, `textured-crop.jpg`,
   `van-dyke.jpg`.
2. Add the `image` field to that catalog entry:

   ```js
   s('curtain-bangs', 'Curtain Bangs', 'women', 'curtain-bangs', TONES.chocolate, {
     meta: 'Face framing · airy',
     image: '/assets/styles/curtain-bangs.jpg'
   })
   ```

`StylePreview` picks the photograph up automatically. Nothing else changes, and
styles without a photograph keep their illustrated preview, so the catalog can
be converted a few at a time.

## Shooting specification

Matching these keeps a mixed grid looking deliberate rather than accidental.

| Property | Value |
| --- | --- |
| Aspect ratio | 3:4 portrait |
| Minimum size | 900 x 1200, ideally 1200 x 1600 |
| Format | JPEG at quality 82 to 88, or WebP |
| Crop | Crown to mid-chest, eyes on the upper third line |
| Head position | Forward facing, level, centred horizontally |
| Background | Plain warm neutral, roughly `#f0e4d8` to `#e0cdbe` |
| Lighting | Soft key from upper left, gentle fill, no hard shadow on the backdrop |
| Focus | Sharp on the hairline and the ends of the hair |
| Retouching | None on face shape or skin texture. Colour grade only |

## What not to change

`public/assets/*.png` at the top level is the existing custom artwork for the
landing page and the studio demo models. Leave those files alone.
