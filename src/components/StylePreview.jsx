'use client';

import { useId, useMemo } from 'react';
import { BEARD_SHAPES, FIGURE, MUSTACHE_PATH, resolveShape } from '../lib/hairShapes';

/**
 * Editorial silhouette preview for a catalog style.
 *
 * Deliberately not photorealistic. The figure is rendered as tonal negative
 * space with no facial features, so the only thing carrying contrast is the
 * hair itself. That reads as a designed system across sixty cards, where sixty
 * attempts at a face would read as sixty near-misses.
 *
 * If `style.image` is set it wins, which is the drop-in point for real studio
 * photography. See public/assets/styles/README.md.
 */

/* -------------------------------------------------------------------------- */
/* Colour helpers                                                              */
/* -------------------------------------------------------------------------- */

const clamp = (n) => Math.min(255, Math.max(0, n));

function toRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (rgb) => '#' + rgb.map((c) => clamp(Math.round(c)).toString(16).padStart(2, '0')).join('');

/** Lightens (amount > 0) or darkens (amount < 0) toward white / black. */
function shift(hex, amount) {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(toRgb(hex).map((c) => c + (target - c) * t));
}

/** Nudges warm (positive) or cool (negative) at roughly constant lightness. */
function temper(hex, amount) {
  const [r, g, b] = toRgb(hex);
  return toHex([r + amount * 24, g + amount * 5, b - amount * 18]);
}

/** Relative luminance, used to keep pale tones readable on a pale backdrop. */
function luminance(hex) {
  const [r, g, b] = toRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/* Backdrop and mannequin pairings, all inside the warm brand family. */
const PALETTES = [
  { bg: ['#f5ebe1', '#e7d5c6'], form: ['#e3cdb8', '#cbae96'] },
  { bg: ['#f1e3da', '#dfc9bc'], form: ['#dec5b0', '#c4a58e'] },
  { bg: ['#f3e8de', '#e2cec0'], form: ['#e0c8b3', '#c7a891'] },
  { bg: ['#efe4e0', '#dcc6c1'], form: ['#dfc7ba', '#c3a598'] }
];

/** Stable small integer from a string, so a style always looks the same. */
function hashOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Where the colour sits in the hair, per salon technique.
 *
 * Solid runs diagonally, which reads as a light source. Everything else runs
 * top to bottom, because that is the axis a colourist actually works along:
 * root to ends.
 *
 * @returns {{vertical: boolean, stops: Array<[number, string]>}}
 */
function gradientFor(technique, hair) {
  switch (technique) {
    case 'Balayage':
      return {
        vertical: true,
        stops: [
          [0, hair.deep],
          [30, hair.mid],
          [72, hair.light],
          [100, hair.lift]
        ]
      };
    case 'Ombré':
      return {
        vertical: true,
        stops: [
          [0, hair.deep],
          [48, hair.deep],
          [80, hair.light],
          [100, hair.lift]
        ]
      };
    case 'Root shadow':
      return {
        vertical: true,
        stops: [
          [0, shiftDeep(hair.deep)],
          [26, hair.mid],
          [100, hair.light]
        ]
      };
    case 'Highlights':
      return {
        vertical: true,
        stops: [
          [0, hair.mid],
          [60, hair.mid],
          [100, hair.light]
        ]
      };
    default:
      return {
        vertical: false,
        stops: [
          [0, hair.light],
          [42, hair.mid],
          [100, hair.deep]
        ]
      };
  }
}

const shiftDeep = (hex) => shift(hex, -0.35);

/** Woven ribbons for the Highlights technique, drawn over the hair mass. */
const STREAK_PATHS = [
  'M158 130 C148 200 146 290 152 400',
  'M186 126 C180 200 178 292 182 402',
  'M216 126 C222 200 224 292 220 402',
  'M244 130 C254 200 256 290 250 400',
  'M132 190 C124 250 124 320 130 396',
  'M270 190 C278 250 278 320 272 396'
];

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function StylePreview({ style, ratio = '3 / 4', className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const art = useMemo(() => {
    const seed = hashOf(style.id);
    const palette = PALETTES[seed % PALETTES.length];
    const tone = style.tone || '#33211d';

    /* Very pale hair on a pale backdrop needs a deeper base to stay legible. */
    const base = luminance(tone) > 0.72 ? shift(tone, -0.18) : tone;

    const hair = {
      light: temper(shift(base, 0.34), style.warm ? 0.4 : 0),
      mid: base,
      deep: shift(base, -0.4),
      sheen: temper(shift(base, 0.6), style.warm ? 0.3 : 0),
      lift: temper(shift(base, 0.58), style.warm ? 0.45 : 0)
    };

    return {
      shape: resolveShape(style.shape),
      beard: style.beard ? BEARD_SHAPES[style.beard] : null,
      palette,
      hair,
      /* The colour catalog keeps one silhouette and varies the colour, so the
         technique has to be what carries the difference between cards. */
      gradient: gradientFor(style.technique, hair),
      streaks: style.technique === 'Highlights',
      /* Small deterministic tilt keeps a grid from feeling stamped out. */
      tilt: ((seed >> 3) % 5) - 2
    };
  }, [style]);

  /* Real photography always wins over the illustration. `image` is a single
     file; `sprite` is a cell in one of the portrait sheets that ship with the
     app (3 across, 2 down, hence 300% x 200%). */
  if (style.image) {
    return (
      <div className={`preview preview--photo ${className}`} style={{ aspectRatio: ratio }}>
        <img src={style.image} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }

  if (style.sprite) {
    return (
      <div
        className={`preview preview--photo ${className}`}
        style={{
          aspectRatio: ratio,
          backgroundImage: `url(${style.sprite.sheet})`,
          backgroundPosition: style.sprite.pos,
          backgroundSize: '300% 200%',
          backgroundRepeat: 'no-repeat'
        }}
      />
    );
  }

  const { shape, beard, palette, hair, gradient, streaks, tilt } = art;
  const g = (name) => `${name}-${uid}`;

  /* Vertical gradients are mapped onto the hair's own bounding box so the root
     stop lands at the crown regardless of how long the style is. */
  const hairGradientCoords = gradient.vertical
    ? { x1: '0%', y1: '0%', x2: '14%', y2: '100%', gradientUnits: 'objectBoundingBox' }
    : { x1: '20%', y1: '2%', x2: '84%', y2: '98%' };

  return (
    <div className={`preview ${className}`} style={{ aspectRatio: ratio }}>
      <svg viewBox="44 44 312 416" preserveAspectRatio="xMidYMid slice" role="presentation" focusable="false">
        <defs>
          <radialGradient id={g('bg')} cx="50%" cy="26%" r="86%">
            <stop offset="0%" stopColor={palette.bg[0]} />
            <stop offset="100%" stopColor={palette.bg[1]} />
          </radialGradient>

          {/* The figure sits only a little off the backdrop, on purpose */}
          <linearGradient id={g('form')} x1="24%" y1="4%" x2="82%" y2="100%">
            <stop offset="0%" stopColor={palette.form[0]} />
            <stop offset="100%" stopColor={palette.form[1]} />
          </linearGradient>

          <linearGradient id={g('hair')} {...hairGradientCoords}>
            {gradient.stops.map(([offset, colour]) => (
              <stop key={offset} offset={`${offset}%`} stopColor={colour} />
            ))}
          </linearGradient>

          {/* The fringe always keeps a root-first reading, whatever the
              technique, because that is the part nearest the scalp. */}
          <linearGradient id={g('hairFront')} x1="12%" y1="0%" x2="88%" y2="76%">
            <stop offset="0%" stopColor={gradient.vertical ? hair.mid : hair.sheen} />
            <stop offset="40%" stopColor={gradient.vertical ? hair.deep : hair.mid} />
            <stop offset="100%" stopColor={hair.deep} />
          </linearGradient>

          {/* Crown sheen, the single strongest cue that this is hair */}
          <radialGradient id={g('sheen')} cx="38%" cy="20%" r="42%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={g('vignette')} x1="0%" y1="46%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.bg[1]} stopOpacity="0" />
            <stop offset="100%" stopColor={shift(palette.bg[1], -0.3)} stopOpacity="0.42" />
          </linearGradient>

          {beard?.texture && (
            <pattern id={g('grain')} width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1.6" cy="1.6" r="0.9" fill={hair.deep} />
              <circle cx="4.2" cy="4.4" r="0.75" fill={hair.deep} />
            </pattern>
          )}

          {shape.back && (
            <clipPath id={g('clipBack')}>
              <path d={shape.back} />
            </clipPath>
          )}
          {shape.front && (
            <clipPath id={g('clipFront')}>
              <path d={shape.front} />
            </clipPath>
          )}
        </defs>

        <rect x="0" y="0" width="400" height="500" fill={`url(#${g('bg')})`} />

        <g transform={`rotate(${tilt} 200 250)`}>
          {/* Hair mass behind the figure. Strand detail goes here rather than
              over the figure, so the head masks any line crossing the face. */}
          {shape.back && (
            <>
              <path d={shape.back} fill={`url(#${g('hair')})`} />
              <g clipPath={`url(#${g('clipBack')})`}>
                {streaks &&
                  STREAK_PATHS.map((d) => (
                    <path
                      key={d}
                      d={d}
                      fill="none"
                      stroke={hair.lift}
                      strokeWidth="11"
                      strokeLinecap="round"
                      opacity="0.62"
                    />
                  ))}
                {shape.extra && (
                  <path
                    d={shape.extra}
                    fill="none"
                    stroke={hair.sheen}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                )}
              </g>
            </>
          )}
          {shape.sides && <path d={shape.sides} fill={hair.deep} />}

          {/* The figure: shoulders, neck and head as one tonal form */}
          <path d={FIGURE.bust} fill={`url(#${g('form')})`} />
          <path d={FIGURE.head} fill={`url(#${g('form')})`} />

          {/* Soft shadow the hair casts onto the forehead */}
          <path d={FIGURE.brow} fill={shift(palette.form[1], -0.3)} opacity="0.18" />

          {/* Facial hair sits over the figure, under the fringe */}
          {beard && (
            <>
              {beard.path && (
                <>
                  <path d={beard.path} fill={`url(#${g('hair')})`} opacity={beard.opacity ?? 1} />
                  {beard.texture && <path d={beard.path} fill={`url(#${g('grain')})`} opacity="0.55" />}
                </>
              )}
              {beard.mustache && (
                <path d={MUSTACHE_PATH} fill={hair.deep} opacity={beard.opacity ?? 1} />
              )}
            </>
          )}

          {/* Fringe and top */}
          {shape.front && <path d={shape.front} fill={`url(#${g('hairFront')})`} />}
          {shape.cap && <path d={shape.cap} fill={hair.mid} opacity="0.55" />}

          {/* Crown light, confined to the fringe */}
          {shape.front && (
            <g clipPath={`url(#${g('clipFront')})`}>
              <rect x="0" y="0" width="400" height="500" fill={`url(#${g('sheen')})`} />
            </g>
          )}
        </g>

        <rect x="0" y="0" width="400" height="500" fill={`url(#${g('vignette')})`} />
      </svg>
    </div>
  );
}

