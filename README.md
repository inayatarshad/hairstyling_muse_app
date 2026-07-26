# hairstyling_muse_app

Muse is a premium consultation platform for salons and studios. It guides a client through portrait capture, gender-appropriate hair and grooming libraries, professional refinement controls, colour direction, review, generation progress, result presentation, saving, and comparison.

## Product modules

- Separate women’s and men’s hairstyle collections
- Male-only beard and grooming workflow
- Guided consultation progress with distinct URL routes
- Portrait upload and demo-model mode
- Hair texture, length, parting, finish, and volume controls
- Colour foundation, technique, and warmth controls
- Ticked five-stage generation timeline
- Finished-result presentation, download, saving, and comparison
- Client book, lookbook, settings, and professional profile
- Persistent private browser storage

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

## Quality assurance

```bash
npm run test:e2e
```

The end-to-end suite covers female and male consultation journeys on desktop and mobile.
