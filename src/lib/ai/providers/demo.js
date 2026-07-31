'use client';

/**
 * Demo provider. Runs the full pipeline with no API key and no network call.
 *
 * What it genuinely does: segments hair on device and recolours that region on
 * the user's own photograph, so colour previews are real.
 *
 * What it cannot do: synthesise new cut geometry. Changing length, fringe, fade
 * or silhouette means generating strands, shadows and scalp occlusion that are
 * not in the source pixels. Rather than fake it, the result reports
 * `geometryApplied: false` and the studio surfaces that honestly.
 */

import { ErrorCode, MuseError, asMuseError } from '../errors';
import { detectHair, loadImage, paintHair } from '../segmentation';
import { throwIfAborted, wait } from '../pipeline';

/** Colour-only categories need no geometry synthesis to be fully accurate. */
const COLOUR_ONLY = new Set(['colour']);

export const demoProvider = {
  id: 'demo',
  label: 'Demo engine',
  requiresKey: false,
  capabilities: {
    colour: true,
    geometry: false,
    beard: false,
    upscale: false
  },

  /** Always ready; that is the point of it. */
  async status() {
    return { ready: true, note: 'Runs on device. No key required.' };
  },

  /**
   * @param {import('../index').GenerateRequest} request
   * @param {ReturnType<import('../pipeline').createReporter>} report
   */
  async generate(request, report, signal) {
    const { image, style, options = {} } = request;
    if (!image) throw new MuseError(ErrorCode.NO_IMAGE);

    try {
      report.enter('upload');
      const source = await loadImage(image);
      throwIfAborted(signal);
      await wait(240, signal);
      report.done('upload');

      report.enter('face');
      await wait(420, signal);
      report.done('face');

      report.enter('identity', 'Confining edits to the detected hair region');
      const mask = await detectHair(source);
      throwIfAborted(signal);

      if (mask.coverage < 0.004) {
        throw new MuseError(
          ErrorCode.FACE_NOT_FOUND,
          `hair coverage ${(mask.coverage * 100).toFixed(2)}% is too low to edit`
        );
      }
      report.done('identity');

      const colourOnly = COLOUR_ONLY.has(style?.cat);

      report.enter('style', colourOnly ? 'Applying the colour story' : 'Applying the available colour direction');
      report.nudge(0.45);
      await wait(360, signal);
      report.done('style');

      report.enter('detail');
      const canvas = document.createElement('canvas');
      paintHair({
        canvas,
        image: source,
        mask,
        tone: options.tone || style?.tone || '#33211d',
        intensity: options.intensity ?? 72,
        warmth: options.warmth ?? 52,
        technique: options.technique || style?.technique || 'Solid'
      });
      throwIfAborted(signal);
      await wait(300, signal);
      report.done('detail');

      report.enter('render');
      const output = canvas.toDataURL('image/jpeg', 0.94);
      await wait(280, signal);
      report.done('render');
      report.finish();

      return {
        image: output,
        width: canvas.width,
        height: canvas.height,
        provider: 'demo',
        simulated: true,
        colourApplied: true,
        geometryApplied: false,
        hairCoverage: mask.coverage,
        note: colourOnly
          ? 'Colour rendered on device from the hair mask in your own photograph.'
          : 'Colour for this look is rendered on device. Cut geometry needs a synthesis provider, so the silhouette in this preview is still your own.'
      };
    } catch (error) {
      throw asMuseError(error, ErrorCode.PROVIDER_ERROR, 'demo');
    }
  }
};

export default demoProvider;
