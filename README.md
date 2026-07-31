# Musè

Musè is a virtual hair studio. Upload one portrait and try hairstyles, beard
shapes and hair colour on your own face, with your identity preserved and
portrait analysis running entirely on your device.

## Product surfaces

**Landing page** at `/`

Sticky glass navigation, a cinematic hero with a draggable before and after, a
scroll-driven How It Works timeline, the style collection, an advantages grid, a
results showcase, testimonials, an animated FAQ, and a closing call to action.

**Studio** at `/studio`

One route, one workflow, nothing in between: upload a photo, choose a style,
generate, compare, download or keep. The style browser is visual rather than
text based, with category tabs, a model toggle, search and per-style refinement
controls. Generation reports six named stages. The result view has a draggable
comparison, zoom, full screen, download and share.

Plus `/lookbook` for kept looks, `/settings` for the engine and privacy
controls, and `/help`.

## What actually runs today

Hair colour is real. A MediaPipe multiclass segmentation model runs in the
browser, produces a hair mask from your own photograph, and recolours only that
region. Luminance from the source pixels drives the shade of every output pixel,
so highlights, shadow and strand separation survive the tone change. The
photograph never leaves the machine for this.

Cut geometry is not real yet. Changing length, fringe, fade or silhouette means
generating strands, shadows and scalp occlusion that are not present in the
source pixels. Rather than fake it, the demo engine reports
`geometryApplied: false` and the studio says so in the result panel.

## Connecting a generation model

No model is wired in. The seam is deliberate and documented.

```
src/lib/ai/
  index.js               generateLook(), the only entry point the UI uses
  pipeline.js            the six stages and the progress protocol
  errors.js              MuseError with typed codes
  segmentation.js        on-device hair mask and recolouring
  providers/
    demo.js              on-device, no key, ships enabled
    remote.js            posts to our own /api/generate, streams progress
    stubs.js             OpenAI, Replicate and self-hosted adapters
app/api/generate/route.js  the server contract, returns 501 until implemented
```

To attach a model, implement `app/api/generate/route.js` and select the adapter
in Settings. The request and response wire format, the progress frame shape, the
error codes and an implementation checklist are all documented in that file.
Nothing in `src/components` needs to change.

## Style previews

Every catalog entry renders an illustrated editorial silhouette
(`src/components/StylePreview.jsx`), built from a shared set of hair shapes in
`src/lib/hairShapes.js`. It is deliberately not photorealistic: the figure is
tonal negative space with no facial features, so the hair carries all the
contrast. That reads as one designed system across sixty cards.

To swap in real photography, drop a file into `public/assets/styles/` and add an
`image` field to that catalog entry. See the README in that folder for the
shooting specification. Styles without a photograph keep their illustration, so
the catalog can be converted a few at a time.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test:e2e
```

The Playwright suite covers the landing sections, the full studio workflow
including on-device segmentation and staged generation, the lookbook, settings
persistence, legacy URL redirects, and the unimplemented API contract. It runs
on desktop and mobile viewports and expects a server on port 3000.
