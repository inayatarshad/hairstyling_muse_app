'use client';

/**
 * On-device hair segmentation and recolouring.
 *
 * Uses the MediaPipe multiclass selfie segmenter that ships in /public/models,
 * so the portrait never leaves the browser. The segmenter is expensive to
 * create, so one instance is cached for the page lifetime.
 *
 * Model category ids: 0 background, 1 hair, 2 body skin, 3 face skin,
 * 4 clothes, 5 other.
 */

import { ErrorCode, MuseError } from './errors';

const HAIR_CLASS = 1;
const MAX_EDGE = 1600;

let segmenterPromise = null;

async function getSegmenter() {
  if (segmenterPromise) return segmenterPromise;

  segmenterPromise = (async () => {
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks('/models/wasm');
    const base = {
      runningMode: 'IMAGE',
      outputCategoryMask: true,
      outputConfidenceMasks: false
    };
    const modelAssetPath = '/models/selfie_multiclass_256x256.tflite';

    try {
      return await ImageSegmenter.createFromOptions(vision, {
        ...base,
        baseOptions: { modelAssetPath, delegate: 'GPU' }
      });
    } catch {
      // Software fallback for machines without a usable WebGL delegate.
      return await ImageSegmenter.createFromOptions(vision, {
        ...base,
        baseOptions: { modelAssetPath, delegate: 'CPU' }
      });
    }
  })().catch((cause) => {
    segmenterPromise = null;
    throw new MuseError(ErrorCode.SEGMENTATION_FAILED, 'segmenter init failed', { cause });
  });

  return segmenterPromise;
}

/** Loads a data URL or path into a decoded HTMLImageElement. */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new MuseError(ErrorCode.BAD_IMAGE, `could not decode ${src.slice(0, 40)}`));
    img.src = src;
  });
}

/** Longest-edge-capped draw size, so huge uploads do not stall the main thread. */
export function fitSize(img, maxEdge = MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  return {
    width: Math.max(1, Math.round(img.naturalWidth * scale)),
    height: Math.max(1, Math.round(img.naturalHeight * scale))
  };
}

/**
 * Runs segmentation and returns the raw hair mask.
 * @returns {Promise<{data: Uint8Array, width: number, height: number, coverage: number}>}
 */
export async function detectHair(image) {
  const segmenter = await getSegmenter();

  const mask = await new Promise((resolve, reject) => {
    try {
      segmenter.segment(image, (result) => {
        const categoryMask = result.categoryMask;
        if (!categoryMask) {
          reject(new MuseError(ErrorCode.SEGMENTATION_FAILED, 'no category mask returned'));
          return;
        }
        const data = new Uint8Array(categoryMask.getAsUint8Array());
        const out = { data, width: categoryMask.width, height: categoryMask.height };
        categoryMask.close?.();
        resolve(out);
      });
    } catch (cause) {
      reject(new MuseError(ErrorCode.SEGMENTATION_FAILED, 'segment() threw', { cause }));
    }
  });

  let hairPixels = 0;
  for (let i = 0; i < mask.data.length; i += 1) {
    if (mask.data[i] === HAIR_CLASS) hairPixels += 1;
  }

  return { ...mask, coverage: hairPixels / mask.data.length };
}

/**
 * Builds a full-resolution soft alpha channel from the low-resolution class
 * mask. Upscaling through a canvas gives free bilinear smoothing, which is
 * what keeps the recoloured edge from looking cut out.
 *
 * @returns {Uint8ClampedArray} RGBA buffer where alpha is hair coverage
 */
function buildAlpha(mask, width, height) {
  const small = document.createElement('canvas');
  small.width = mask.width;
  small.height = mask.height;
  const sctx = small.getContext('2d');
  const maskImage = sctx.createImageData(mask.width, mask.height);
  for (let i = 0; i < mask.data.length; i += 1) {
    maskImage.data[i * 4 + 3] = mask.data[i] === HAIR_CLASS ? 255 : 0;
  }
  sctx.putImageData(maskImage, 0, 0);

  const scaled = document.createElement('canvas');
  scaled.width = width;
  scaled.height = height;
  const mctx = scaled.getContext('2d', { willReadFrequently: true });
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(small, 0, 0, width, height);
  return mctx.getImageData(0, 0, width, height).data;
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * Draws `image` into `canvas` and recolours the masked hair region.
 *
 * Luminance from the original photograph drives the shade of every pixel, so
 * existing highlights, shadow and strand separation survive the tone change
 * rather than being flattened into a solid block of colour.
 *
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas
 * @param {HTMLImageElement}  options.image
 * @param {object|null}       options.mask       from detectHair, or null to draw untouched
 * @param {string}            options.tone       target hex
 * @param {number}            options.intensity  0 to 100
 * @param {number}            options.warmth     0 to 100, 50 is neutral
 * @param {string}            options.technique  Solid | Highlights | Balayage | Ombré | Root shadow
 */
export function paintHair({ canvas, image, mask, tone, intensity = 72, warmth = 52, technique = 'Solid' }) {
  const { width, height } = fitSize(image);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  if (!mask) return;

  const frame = ctx.getImageData(0, 0, width, height);
  const px = frame.data;
  const alpha = buildAlpha(mask, width, height);
  const [tr, tg, tb] = hexToRgb(tone);
  const strength = Math.min(1, Math.max(0, intensity / 100));
  const warm = (warmth - 50) / 50;

  for (let i = 0; i < px.length; i += 4) {
    let a = (alpha[i + 3] / 255) * strength;
    if (a < 0.02) continue;

    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Technique changes where the colour lands vertically or by brightness.
    if (technique !== 'Solid') {
      const y = Math.floor(i / 4 / width) / height;
      if (technique === 'Balayage') a *= 0.28 + Math.min(1, y * 1.9);
      else if (technique === 'Ombré') a *= Math.pow(Math.min(1, y * 1.35), 1.5);
      else if (technique === 'Root shadow') a *= 1 - Math.min(0.85, y * 1.1);
      else if (technique === 'Highlights') a *= 0.34 + (lum / 255) * 1.1;
      a = Math.min(1, a);
      if (a < 0.02) continue;
    }

    const shade = 0.42 + (lum / 255) * 0.76;
    const cr = Math.min(255, tr * shade + lum * 0.28 + Math.max(0, warm) * 10);
    const cg = Math.min(255, tg * shade + lum * 0.28);
    const cb = Math.min(255, tb * shade + lum * 0.28 + Math.max(0, -warm) * 10);

    px[i] = r * (1 - a) + cr * a;
    px[i + 1] = g * (1 - a) + cg * a;
    px[i + 2] = b * (1 - a) + cb * a;
  }

  ctx.putImageData(frame, 0, 0);
}
