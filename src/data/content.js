/**
 * Marketing copy for the landing page. Kept out of the components so the words
 * can be edited without touching layout.
 */

export const HERO_PROOF = [
  {
    icon: 'Upload',
    title: 'Upload your photo',
    copy: 'One clear front-facing portrait is all it takes. Nothing leaves your device unless you generate.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Identity preserved',
    copy: 'Your face, skin, expression and age stay exactly as they are. Only the hair region changes.'
  },
  {
    icon: 'Layers',
    title: 'Compare looks',
    copy: 'Hold every result side by side, drag between before and after, and keep the ones that work.'
  }
];

export const STEPS = [
  {
    n: '01',
    icon: 'Upload',
    title: 'Upload your photo',
    copy: 'Drop in a front-facing portrait. Musè checks framing, lighting and hairline before anything else runs.'
  },
  {
    n: '02',
    icon: 'ScanFace',
    title: 'AI reads your features',
    copy: 'Face geometry, hairline and the exact hair region are mapped so edits stay inside the boundary that matters.'
  },
  {
    n: '03',
    icon: 'Scissors',
    title: 'Choose a hairstyle',
    copy: 'Browse cuts, colours, waves and beards visually. Tap a look to load it. No sliders required to start.'
  },
  {
    n: '04',
    icon: 'Sparkles',
    title: 'Generate the preview',
    copy: 'Watch each stage complete in sequence, from face detection through identity protection to final render.'
  },
  {
    n: '05',
    icon: 'GitCompareArrows',
    title: 'Compare before and after',
    copy: 'Drag the divider across your own portrait. Zoom in. Switch to full screen. Decide with real evidence.'
  },
  {
    n: '06',
    icon: 'Download',
    title: 'Download or save',
    copy: 'Export at full resolution, keep variations in your lookbook, and take a clear brief to your stylist.'
  }
];

export const ADVANTAGES = [
  {
    icon: 'ShieldCheck',
    title: 'Identity preservation',
    copy: 'Face shape, skin tone, expression and age are locked. The edit is confined to the detected hair region.'
  },
  {
    icon: 'Aperture',
    title: 'Realistic rendering',
    copy: 'Strand direction, root shadow and scalp occlusion are respected, so the result reads as photography.'
  },
  {
    icon: 'Zap',
    title: 'Fast generation',
    copy: 'Colour previews redraw on device in real time. Full renders stream progress stage by stage.'
  },
  {
    icon: 'Gem',
    title: 'Professional quality',
    copy: 'Built with salon vocabulary: fade heights, cheek lines, root shadows, technique briefs.'
  },
  {
    icon: 'Maximize2',
    title: 'HD output',
    copy: 'Export at the full resolution of your original portrait, with no upscaling artefacts or crops.'
  },
  {
    icon: 'GitCompareArrows',
    title: 'Before and after',
    copy: 'A draggable comparison on your own photograph, not a stock model wearing the style instead of you.'
  },
  {
    icon: 'Sun',
    title: 'Natural lighting',
    copy: 'The lighting already in your photograph is sampled and carried into the new hair, highlights included.'
  },
  {
    icon: 'ScanFace',
    title: 'Face aware styling',
    copy: 'Every suggestion is filtered against your face geometry, so nothing offered is impossible to wear.'
  }
];

export const SHOWCASE = [
  {
    id: 'girl',
    label: 'Long layers, warm balayage',
    before: '/assets/before-girl.png',
    after: '/assets/after-girl.png',
    style: 'Long Layers',
    tone: 'Honey Balayage'
  },
  {
    id: 'boy',
    label: 'Textured quiff, natural depth',
    before: '/assets/before-boy.png',
    after: '/assets/after-boy.png',
    style: 'Textured Quiff',
    tone: 'Natural Espresso'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Sofia Rahman',
    role: 'Creative director',
    quote:
      'I had wanted a bob for two years and never committed. Fifteen minutes with Musè and I finally saw it on my own face instead of on a model who looks nothing like me.',
    rating: 5,
    tone: '#4a2f26'
  },
  {
    name: 'Daniel Okonkwo',
    role: 'Barber, Kensington',
    quote:
      'I use it during consultations now. Clients stop describing what they want in words and just point at the screen. Fewer surprises, better appointments.',
    rating: 5,
    tone: '#171313'
  },
  {
    name: 'Mei Tanaka',
    role: 'Product designer',
    quote:
      'The before and after slider is the whole product for me. Being able to drag across my actual photograph is what made me trust the result.',
    rating: 5,
    tone: '#2b1c19'
  },
  {
    name: 'Elena Vasquez',
    role: 'Colourist',
    quote:
      'The colour engine understands root shadow and warmth, which almost nothing else does. I use it to set expectations before a client commits to a lift.',
    rating: 5,
    tone: '#a9764e'
  },
  {
    name: 'James Whitfield',
    role: 'Photographer',
    quote:
      'It kept my face genuinely intact. Every other tool I tried quietly smoothed my skin and made me look ten years younger, which I did not ask for.',
    rating: 5,
    tone: '#6b4433'
  },
  {
    name: 'Amara Diallo',
    role: 'Salon owner',
    quote:
      'Protective styles are represented properly here, which is rarer than it should be. That alone earned my recommendation to clients.',
    rating: 5,
    tone: '#7a3b28'
  }
];

export const FAQ = [
  {
    q: 'Do I need a professional photograph?',
    a: 'No. A phone selfie works well as long as your face is clear, forward facing, and your full hairline is visible. Even indoor lighting is fine. Musè runs a quality check on the portrait before generation and tells you specifically what to fix if something will hurt the result.'
  },
  {
    q: 'Will it actually still look like me?',
    a: 'That is the constraint the whole product is built around. Identity preservation is on by default and confines every edit to the detected hair or beard region. Face shape, skin tone, expression, age, clothing and background are carried through from your original photograph untouched.'
  },
  {
    q: 'What happens to my photo?',
    a: 'Portrait analysis and live colour rendering run entirely in your browser using an on-device segmentation model, so your photograph never leaves your machine for those steps. Saved looks live in this browser only. Nothing is used for model training.'
  },
  {
    q: 'How accurate are the results?',
    a: 'Colour is highly accurate because it is applied to a real hair mask taken from your own photograph. Cut geometry is a preview meant to guide a conversation, not a guarantee. Your current length, density and growth pattern all affect what a stylist can achieve, which is why every result ships with a stylist note.'
  },
  {
    q: 'Does it work for textured and protective styles?',
    a: 'Yes. The catalog includes coils, defined curls, braided crowns and protective styles as first-class entries rather than afterthoughts, and the segmentation model handles high-volume hair without clipping the silhouette.'
  },
  {
    q: 'Can men use it for beards as well as hair?',
    a: 'Yes. The beard studio covers stubble through to Garibaldi, including detached shapes like the Van Dyke and Balbo, with separate controls for length, density, cheek line and shape. Hair and beard colour stay coordinated automatically.'
  },
  {
    q: 'What does it cost?',
    a: 'Browsing the catalog, uploading a portrait and using the live colour studio are all free and unlimited. Full renders consume one credit each. The demo engine included in this build runs the complete workflow without a key so you can evaluate everything first.'
  },
  {
    q: 'Can I use the result at a salon?',
    a: 'That is what it is for. Every result includes a written brief with the cut name, length, texture, volume, fade height and colour technique in professional vocabulary, so you can hand your stylist something precise instead of a vague description.'
  }
];

export const STATS = [
  { value: 60, suffix: '+', label: 'Curated styles' },
  { value: 14, suffix: '', label: 'Colour stories' },
  { value: 13, suffix: '', label: 'Beard shapes' },
  { value: 100, suffix: '%', label: 'On-device colour' }
];

