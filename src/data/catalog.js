/**
 * Musè style catalog.
 *
 * One flat list of styles plus the category definitions that slice it. Each
 * entry drives both the illustrated preview (src/components/StylePreview.jsx)
 * and the generation request sent to the configured provider.
 *
 * Fields
 *   id        stable key, also the filename real photography would use
 *   name      label shown on the card
 *   cat       primary category id
 *   gender    'female' | 'male' | 'any'
 *   shape     hair silhouette id from lib/hairShapes.js
 *   tone      hex hair colour used by the preview and the colour engine
 *   beard     beard silhouette id, beard styles only
 *   flags     ['new'] and/or ['trending'], surfaced as badges and feed tabs
 *   meta      one-line descriptor under the name
 *   prompt    plain-language brief handed to a synthesis provider later
 *
 * `image` is intentionally absent. Setting it to a path under
 * /assets/styles/ makes StylePreview use that photograph instead of the
 * vector portrait, with no other code change.
 */

export const TONES = {
  black: '#171313',
  espresso: '#2b1c19',
  chocolate: '#4a2f26',
  chestnut: '#6b4433',
  auburn: '#7a3b28',
  copper: '#a85433',
  caramel: '#a9764e',
  honey: '#c69d6d',
  ash: '#b9a98f',
  platinum: '#e0d5c2',
  burgundy: '#5e1a24',
  silver: '#b7b3ae'
};

const s = (id, name, cat, shape, tone, extra = {}) => ({
  id,
  name,
  cat,
  shape,
  tone,
  gender: extra.gender || (cat === 'men' || cat === 'beard' ? 'male' : 'female'),
  flags: extra.flags || [],
  meta: extra.meta || '',
  prompt: extra.prompt || name,
  ...extra
});

/* ========================================================================== */
/* Women's cuts                                                                */
/* ========================================================================== */

const WOMEN = [
  s('bob', 'Sculpted Bob', 'women', 'bob', TONES.espresso, {
    meta: 'Chin length · polished',
    flags: ['trending'],
    prompt: 'a precise chin-length bob with a blunt perimeter and soft interior movement'
  }),
  s('sharp-bob', 'Sharp Cut Bob', 'women', 'sharp-bob', TONES.black, {
    meta: 'Blunt line · graphic',
    flags: ['new'],
    prompt: 'a sharp blunt bob with a razor-straight perimeter at jaw level'
  }),
  s('air-bob', 'Soft Air Bob', 'women', 'bob', TONES.chestnut, {
    meta: 'Weightless · airy',
    flags: ['new', 'trending'],
    prompt: 'an airy soft bob with feathered ends and light internal layering'
  }),
  s('layers', 'Long Layers', 'women', 'long-wavy', TONES.chocolate, {
    meta: 'Long · movement',
    flags: ['trending'],
    prompt: 'long face-framing layers with soft graduated movement through the ends'
  }),
  s('pixie', 'Modern Pixie', 'women', 'pixie', TONES.chestnut, {
    meta: 'Very short · textured',
    prompt: 'a modern textured pixie cut with a piecey fringe and tapered nape'
  }),
  s('long-hair', 'Long & Straight', 'women', 'long-straight', TONES.black, {
    meta: 'Long · sleek',
    prompt: 'long straight hair with a glossy finish and a clean blunt hemline'
  }),
  s('short-hair', 'Short Lob', 'women', 'lob', TONES.caramel, {
    meta: 'Shoulder length · soft',
    prompt: 'a collarbone-length lob with subtle layering'
  }),
  s('bangs', 'Full Bangs', 'women', 'bangs', TONES.espresso, {
    meta: 'Long · full fringe',
    prompt: 'long hair with a full straight-across fringe at brow level'
  }),
  s('curtain-bangs', 'Curtain Bangs', 'women', 'curtain-bangs', TONES.chocolate, {
    meta: 'Face framing · airy',
    flags: ['trending'],
    prompt: 'centre-parted curtain bangs sweeping outward, blended into long layers'
  }),
  s('wispy-bangs', 'Wispy Bangs', 'women', 'wispy-bangs', TONES.chestnut, {
    meta: 'Sheer · delicate',
    flags: ['new'],
    prompt: 'fine wispy see-through bangs over long hair'
  }),
  s('wolf-cut', 'Wolf Cut', 'women', 'wolf-cut', TONES.chocolate, {
    meta: 'Shag · high volume',
    flags: ['trending'],
    prompt: 'a wolf cut blending shag and mullet, heavy crown volume, wispy ends'
  }),
  s('ponytail', 'High Ponytail', 'women', 'ponytail', TONES.black, {
    meta: 'Lifted · sleek',
    prompt: 'a sleek high ponytail with a smooth pulled-back crown'
  }),
  s('braids', 'Braided Crown', 'women', 'braids', TONES.black, {
    meta: 'Protective · refined',
    prompt: 'neat cornrow braids gathered into a sculpted crown with two long fall strands'
  }),
  s('sleek-bun', 'Sleek Bun', 'women', 'sleek-bun', TONES.espresso, {
    meta: 'Polished · editorial',
    flags: ['new'],
    prompt: 'a low polished chignon bun with a glass-smooth crown'
  }),
  s('curly', 'Volume Curls', 'women', 'curly', TONES.espresso, {
    meta: 'Round · full',
    prompt: 'full rounded natural curls with defined spring and halo volume'
  }),
  s('defined-curls', 'Defined Curls', 'women', 'defined-curls', TONES.chocolate, {
    meta: 'Sculpted · springy',
    flags: ['trending'],
    prompt: 'tightly defined ringlet curls with high definition and separation'
  })
];

/* ========================================================================== */
/* Wavy                                                                        */
/* ========================================================================== */

const WAVY = [
  s('casual-waves', 'Casual Waves', 'wavy', 'beach-waves', TONES.chestnut, {
    meta: 'Undone · everyday',
    prompt: 'relaxed casual waves with a lived-in undone texture'
  }),
  s('loose-waves', 'Loose Waves', 'wavy', 'long-wavy', TONES.chocolate, {
    meta: 'Open bend · soft',
    prompt: 'loose open waves with a wide gentle bend'
  }),
  s('beach-waves', 'Beach Waves', 'wavy', 'beach-waves', TONES.caramel, {
    meta: 'Salt texture · matte',
    flags: ['trending'],
    prompt: 'tousled beach waves with a matte sea-salt texture'
  }),
  s('hollywood-waves', 'Hollywood Waves', 'wavy', 'long-wavy', TONES.black, {
    meta: 'Glossy · sculpted',
    flags: ['new'],
    prompt: 'sculpted glossy old-Hollywood waves with a uniform S-bend'
  }),
  s('curly-waves', 'Curly Waves', 'wavy', 'defined-curls', TONES.chestnut, {
    meta: 'Tight bend · lively',
    prompt: 'waves tightening into soft curls through the mid-lengths'
  }),
  s('soft-waves', 'Soft Waves', 'wavy', 'beach-waves', TONES.honey, {
    meta: 'Diffused · light',
    prompt: 'very soft diffused waves with a light airy finish'
  }),
  s('luxe-waves', 'Luxe Waves', 'wavy', 'long-wavy', TONES.caramel, {
    meta: 'Full body · rich',
    flags: ['new', 'trending'],
    prompt: 'voluminous luxe waves with rich body and high shine'
  })
];

/* ========================================================================== */
/* Hair colour                                                                 */
/* ========================================================================== */

const colour = (id, name, tone, meta, extra = {}) =>
  s(id, name, 'colour', extra.shape || 'long-wavy', tone, {
    meta,
    gender: 'any',
    technique: extra.technique || 'Solid',
    ...extra
  });

const COLOUR = [
  colour('honey-blonde', 'Honey Blonde', TONES.honey, 'Warm gold · luminous', {
    warm: true,
    flags: ['trending'],
    prompt: 'a warm honey blonde with golden luminosity'
  }),
  colour('ash-blonde', 'Ash Blonde', TONES.ash, 'Cool neutral · matte', {
    prompt: 'a cool ash blonde with neutral beige undertones'
  }),
  colour('platinum-blonde', 'Platinum Blonde', TONES.platinum, 'Icy · high lift', {
    flags: ['new'],
    prompt: 'an icy platinum blonde at high lift with a clean white base'
  }),
  colour('chocolate-brown', 'Chocolate Brown', TONES.chocolate, 'Deep warm · glossy', {
    warm: true,
    prompt: 'a rich glossy chocolate brown'
  }),
  colour('caramel-swirl', 'Caramel Swirl', TONES.caramel, 'Ribboned · dimensional', {
    technique: 'Highlights',
    warm: true,
    flags: ['trending'],
    prompt: 'caramel ribbons swirled through a brunette base for dimension'
  }),
  colour('honey-balayage', 'Honey Balayage', TONES.honey, 'Hand painted · soft root', {
    technique: 'Balayage',
    warm: true,
    flags: ['new', 'trending'],
    prompt: 'a hand-painted honey balayage with a soft shadow root'
  }),
  colour('caramel-frame', 'Caramel Frame', TONES.caramel, 'Face framing · bright', {
    technique: 'Highlights',
    warm: true,
    prompt: 'bright caramel money-piece framing the face'
  }),
  colour('copper', 'Copper', TONES.copper, 'Vivid warm · saturated', {
    warm: true,
    flags: ['trending'],
    prompt: 'a saturated vivid copper'
  }),
  colour('burgundy', 'Burgundy', TONES.burgundy, 'Deep wine · rich', {
    prompt: 'a deep burgundy wine tone'
  }),
  colour('black', 'Natural Black', TONES.black, 'True depth · reflective', {
    prompt: 'a true natural black with high reflective shine'
  }),
  colour('auburn', 'Auburn', TONES.auburn, 'Red brown · earthy', {
    warm: true,
    prompt: 'an earthy auburn red-brown'
  }),
  colour('highlights', 'Fine Highlights', TONES.honey, 'Woven · sunlit', {
    technique: 'Highlights',
    warm: true,
    prompt: 'finely woven sunlit highlights on a brunette base'
  }),
  colour('balayage', 'Classic Balayage', TONES.caramel, 'Graduated · natural', {
    technique: 'Balayage',
    warm: true,
    prompt: 'a classic graduated balayage, darker root melting into lighter ends'
  }),
  colour('silver', 'Soft Silver', TONES.silver, 'Cool grey · matte', {
    flags: ['new'],
    prompt: 'a soft matte silver grey'
  })
];

/* ========================================================================== */
/* Men's cuts                                                                  */
/* ========================================================================== */

const MEN = [
  s('fade', 'Classic Fade', 'men', 'fade', TONES.espresso, {
    meta: 'Tapered · clean',
    flags: ['trending'],
    prompt: 'a classic tapered fade with a clean blended transition'
  }),
  s('low-fade', 'Low Fade', 'men', 'fade', TONES.black, {
    meta: 'Fades near ear · subtle',
    prompt: 'a low fade starting just above the ear, subtle and conservative'
  }),
  s('mid-fade', 'Mid Fade', 'men', 'fade', TONES.chocolate, {
    meta: 'Balanced · versatile',
    prompt: 'a mid fade starting at the temple with an even gradient'
  }),
  s('high-fade', 'High Fade', 'men', 'fade', TONES.black, {
    meta: 'Bold contrast · sharp',
    flags: ['new'],
    prompt: 'a high fade with strong contrast and a sharp guideline'
  }),
  s('crew-cut', 'Crew Cut', 'men', 'crew-cut', TONES.chestnut, {
    meta: 'Short · uniform',
    prompt: 'a neat crew cut, short and uniform with a slightly longer front'
  }),
  s('buzz-cut', 'Buzz Cut', 'men', 'buzz', TONES.black, {
    meta: 'Clipper short · minimal',
    prompt: 'a single-length buzz cut close to the scalp'
  }),
  s('pompadour', 'Pompadour', 'men', 'pompadour', TONES.espresso, {
    meta: 'High volume · swept',
    flags: ['trending'],
    prompt: 'a full pompadour with height at the front swept up and back'
  }),
  s('slick-back', 'Slick Back', 'men', 'slick-back', TONES.black, {
    meta: 'Glossy · combed',
    prompt: 'hair combed straight back with a glossy wet finish'
  }),
  s('textured-crop', 'Textured Crop', 'men', 'textured-crop', TONES.chocolate, {
    meta: 'Matte · piecey',
    flags: ['new', 'trending'],
    prompt: 'a French textured crop with a piecey matte fringe and faded sides'
  }),
  s('undercut', 'Undercut', 'men', 'undercut', TONES.espresso, {
    meta: 'Disconnected · bold',
    prompt: 'a disconnected undercut, long on top with short uniform sides'
  }),
  s('middle-part', 'Middle Part', 'men', 'middle-part', TONES.chestnut, {
    meta: 'Medium · centred',
    flags: ['trending'],
    prompt: 'medium-length hair with a defined centre part falling either side'
  }),
  s('curly-men', 'Curly Top', 'men', 'curly-men', TONES.black, {
    meta: 'Defined curls · faded',
    prompt: 'defined natural curls on top with tapered faded sides'
  }),
  s('quiff', 'Textured Quiff', 'men', 'quiff-taper', TONES.chocolate, {
    meta: 'Lifted front · soft',
    flags: ['new'],
    prompt: 'a textured quiff lifted at the front with a soft taper'
  })
];

/* ========================================================================== */
/* Beards                                                                      */
/* ========================================================================== */

const b = (id, name, beard, meta, extra = {}) =>
  s(id, name, 'beard', extra.shape || 'textured-crop', extra.tone || TONES.espresso, {
    beard,
    meta,
    ...extra
  });

const BEARD = [
  b('clean-shaven', 'Clean Shaven', 'clean', 'Bare · precise'),
  b('stubble', 'Stubble', 'stubble', '3 to 5 days · natural', {
    flags: ['trending'],
    prompt: 'short even stubble at roughly three to five days of growth'
  }),
  b('short-boxed', 'Short Boxed', 'short-boxed', 'Structured · tidy', {
    flags: ['trending'],
    prompt: 'a short boxed beard with defined cheek and neck lines'
  }),
  b('full-beard', 'Full Beard', 'full', 'Dense · balanced', {
    prompt: 'a full dense beard, evenly shaped and balanced to the jaw'
  }),
  b('corporate-beard', 'Corporate Beard', 'corporate', 'Trimmed · professional', {
    flags: ['new'],
    prompt: 'a closely trimmed corporate beard with sharp clean edges'
  }),
  b('goatee', 'Goatee', 'goatee', 'Chin only · minimal', {
    prompt: 'a chin-only goatee with bare cheeks'
  }),
  b('extended-goatee', 'Extended Goatee', 'extended-goatee', 'Linked · defined', {
    prompt: 'an extended goatee joined to the moustache along the jawline'
  }),
  b('van-dyke', 'Van Dyke', 'van-dyke', 'Detached · classic', {
    flags: ['new'],
    prompt: 'a Van Dyke: pointed chin beard with a detached moustache'
  }),
  b('anchor', 'Anchor Beard', 'anchor', 'Sharp · expressive', {
    prompt: 'an anchor beard tracing the jawline into a pointed chin with a moustache'
  }),
  b('balbo', 'Balbo', 'balbo', 'Sculpted · modern', {
    flags: ['trending'],
    prompt: 'a Balbo beard, floating moustache above a shaped chin beard, no sideburns'
  }),
  b('garibaldi', 'Garibaldi', 'garibaldi', 'Long · rounded', {
    prompt: 'a long rounded Garibaldi beard with a wide natural base'
  }),
  b('chin-strap', 'Chin Strap', 'chin-strap', 'Outline · graphic', {
    prompt: 'a narrow chin strap outlining the jaw'
  }),
  b('moustache', 'Moustache', 'mustache', 'Standalone · retro', {
    flags: ['new'],
    prompt: 'a standalone moustache with clean-shaven cheeks and chin'
  })
];

/* ========================================================================== */
/* Assembled catalog                                                           */
/* ========================================================================== */

export const STYLES = [...WOMEN, ...WAVY, ...COLOUR, ...MEN, ...BEARD];

export const STYLE_BY_ID = STYLES.reduce((map, style) => {
  map[style.id] = style;
  return map;
}, {});

/**
 * Category tabs. `feed` categories filter the whole catalog by flag rather
 * than by primary category, matching how New and Trending behave.
 */
export const CATEGORIES = [
  { id: 'new', label: 'New', gender: 'any', feed: 'new', blurb: 'Just added to the studio' },
  { id: 'trending', label: 'Trending', gender: 'any', feed: 'trending', blurb: 'Most requested this season' },
  { id: 'women', label: "Women's cuts", gender: 'female', blurb: 'Silhouette and length' },
  { id: 'wavy', label: 'Wavy', gender: 'female', blurb: 'Bend, body and movement' },
  { id: 'colour', label: 'Hair colour', gender: 'any', blurb: 'Tone, dimension and technique' },
  { id: 'men', label: "Men's cuts", gender: 'male', blurb: 'Fades, crops and volume' },
  { id: 'beard', label: 'Beard', gender: 'male', blurb: 'Shape, density and edges' }
];

/** Styles for a category, narrowed to the selected model gender. */
export function stylesFor(categoryId, gender) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return [];

  const matchesGender = (style) => style.gender === 'any' || style.gender === gender;

  if (category.feed) {
    return STYLES.filter((style) => style.flags.includes(category.feed) && matchesGender(style));
  }
  return STYLES.filter((style) => style.cat === categoryId && matchesGender(style));
}

/** Categories that have at least one style for this gender. */
export function categoriesFor(gender) {
  return CATEGORIES.filter(
    (c) => (c.gender === 'any' || c.gender === gender) && stylesFor(c.id, gender).length > 0
  );
}

/* ========================================================================== */
/* Refinements                                                                 */
/* ========================================================================== */

/**
 * Post-selection adjustments. Which set applies is decided by the selected
 * style's category, so the panel never shows a control that cannot do anything.
 */
export const REFINEMENTS = {
  women: [
    { key: 'length', label: 'Length', options: ['Very short', 'Short', 'Medium', 'Long', 'Extra long'], default: 'Long' },
    { key: 'volume', label: 'Volume', options: ['Subtle', 'Natural', 'Medium', 'High', 'Maximised'], default: 'Natural' },
    { key: 'texture', label: 'Texture', options: ['Straight', 'Slight bend', 'Wavy', 'Curly', 'Coily'], default: 'Straight' },
    { key: 'parting', label: 'Parting', options: ['Centre', 'Slight left', 'Deep left', 'Slight right', 'None'], default: 'Centre' },
    { key: 'finish', label: 'Finish', options: ['Matte', 'Natural', 'Satin', 'Glossy'], default: 'Natural' }
  ],
  wavy: [
    { key: 'volume', label: 'Volume', options: ['Subtle', 'Natural', 'Medium', 'High', 'Maximised'], default: 'Medium' },
    { key: 'length', label: 'Length', options: ['Short', 'Medium', 'Long', 'Extra long'], default: 'Long' },
    { key: 'finish', label: 'Finish', options: ['Matte', 'Natural', 'Satin', 'Glossy'], default: 'Satin' }
  ],
  colour: [
    { key: 'technique', label: 'Technique', options: ['Solid', 'Highlights', 'Balayage', 'Ombré', 'Root shadow'], default: 'Solid' },
    { key: 'intensity', label: 'Intensity', range: true, default: 72, unit: '%' },
    { key: 'warmth', label: 'Warmth', range: true, default: 52, unit: '%', poles: ['Cool', 'Warm'] }
  ],
  men: [
    { key: 'fade', label: 'Fade height', options: ['None', 'Low taper', 'Mid fade', 'High fade', 'Skin fade'], default: 'Mid fade' },
    { key: 'length', label: 'Top length', options: ['Very short', 'Short', 'Medium', 'Long'], default: 'Short' },
    { key: 'finish', label: 'Finish', options: ['Matte', 'Natural', 'Satin', 'Glossy'], default: 'Matte' },
    { key: 'parting', label: 'Parting', options: ['None', 'Centre', 'Slight left', 'Slight right'], default: 'None' }
  ],
  beard: [
    { key: 'beardLength', label: 'Length', options: ['Shadow', 'Stubble', 'Short', 'Medium', 'Long'], default: 'Short' },
    { key: 'beardDensity', label: 'Density', options: ['Sparse', 'Natural', 'Dense', 'Very dense'], default: 'Natural' },
    { key: 'cheek', label: 'Cheek line', options: ['Natural', 'Low', 'Medium', 'High', 'Sharp'], default: 'Natural' },
    { key: 'beardShape', label: 'Shape', options: ['Rounded', 'Square', 'Pointed', 'Tapered'], default: 'Rounded' }
  ]
};

export function refinementsFor(style) {
  if (!style) return [];
  return REFINEMENTS[style.cat] || REFINEMENTS.women;
}

/* ========================================================================== */
/* Real photography                                                            */
/* ========================================================================== */

/**
 * The twelve studio portraits that already ship with the app, addressed as
 * sprite-sheet cells. Used for the landing showcase and the studio demo
 * models. Kept separate from STYLES so the catalog stays visually consistent.
 */
export const PHOTO_CELLS = {
  women: {
    sheet: '/assets/women-hair-styles.png',
    cells: [
      { id: 'bob', name: 'Sculpted Bob', pos: '0% 0%' },
      { id: 'layers', name: 'Long Layers', pos: '50% 0%' },
      { id: 'pixie', name: 'Modern Pixie', pos: '100% 0%' },
      { id: 'luxe-waves', name: 'Luxe Waves', pos: '0% 100%' },
      { id: 'defined-curls', name: 'Defined Curls', pos: '50% 100%' },
      { id: 'braids', name: 'Braided Crown', pos: '100% 100%' }
    ]
  },
  men: {
    sheet: '/assets/men-hair-styles.png',
    cells: [
      { id: 'textured-crop', name: 'Textured Crop', pos: '0% 0%' },
      { id: 'middle-part', name: 'Taper Part', pos: '50% 0%' },
      { id: 'quiff', name: 'Textured Quiff', pos: '100% 0%' },
      { id: 'curly-men', name: 'Curly Top', pos: '0% 100%' },
      { id: 'buzz-cut', name: 'Buzz Cut', pos: '50% 100%' },
      { id: 'slick-back', name: 'Swept Back', pos: '100% 100%' }
    ]
  },
  beard: {
    sheet: '/assets/beard-styles.png',
    cells: [
      { id: 'clean-shaven', name: 'Clean Shaven', pos: '0% 0%' },
      { id: 'stubble', name: 'Stubble', pos: '50% 0%' },
      { id: 'short-boxed', name: 'Short Boxed', pos: '100% 0%' },
      { id: 'full-beard', name: 'Full Beard', pos: '0% 100%' },
      { id: 'goatee', name: 'Goatee', pos: '50% 100%' },
      { id: 'anchor', name: 'Anchor Beard', pos: '100% 100%' }
    ]
  }
};

/** Demo portraits offered when someone wants to try the studio without a photo. */
export const DEMO_MODELS = [
  { id: 'demo-female', label: 'Female model', gender: 'female', src: '/assets/before-girl.png' },
  { id: 'demo-male', label: 'Male model', gender: 'male', src: '/assets/before-boy.png' }
];

/**
 * Attach the real studio photography to the styles it genuinely depicts.
 *
 * Done here rather than by hand on each entry so the mapping lives in exactly
 * one place. StylePreview prefers `sprite` over its illustrated fallback, so
 * these eighteen styles show a real portrait everywhere they appear.
 *
 * Styles without a photograph keep the illustration. Adding photography for
 * them is a matter of dropping files into public/assets/styles/ and setting
 * `image` on the entry; see the README in that folder.
 */
Object.values(PHOTO_CELLS).forEach(({ sheet, cells }) => {
  cells.forEach((cell) => {
    const style = STYLE_BY_ID[cell.id];
    if (style) style.sprite = { sheet, pos: cell.pos };
  });
});

/** Ids that currently have real photography, for the coverage note in Help. */
export const PHOTOGRAPHED = Object.values(PHOTO_CELLS)
  .flatMap(({ cells }) => cells.map((cell) => cell.id))
  .filter((id) => STYLE_BY_ID[id]);
