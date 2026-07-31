'use client';

/**
 * Named model adapters, deliberately not implemented.
 *
 * Each one declares the capabilities it would offer and refuses cleanly with
 * NOT_CONFIGURED. That gives the settings UI something real to list, and gives
 * whoever wires the model a single obvious place to do it.
 *
 * To implement one: replace `generate` with a call to your server route (see
 * providers/remote.js for the wire format) and flip `requiresKey` handling in
 * `status()`. Nothing in the studio needs to change.
 */

import { ErrorCode, MuseError } from '../errors';

function stub({ id, label, note, capabilities, docs }) {
  return {
    id,
    label,
    requiresKey: true,
    capabilities,
    docs,

    async status() {
      return { ready: false, note };
    },

    async generate() {
      throw new MuseError(ErrorCode.NOT_CONFIGURED, `${id} adapter is not implemented`, { provider: id });
    }
  };
}

/** Image editing via an OpenAI images endpoint, called from our own server route. */
export const openaiProvider = stub({
  id: 'openai',
  label: 'OpenAI Images',
  note: 'Needs OPENAI_API_KEY on the server and an implemented /api/generate handler.',
  capabilities: { colour: true, geometry: true, beard: true, upscale: false },
  docs: 'Send the portrait plus style.prompt as an edit request with a hair-region mask.'
});

/** Hosted diffusion or a dedicated hair-transfer model on Replicate. */
export const replicateProvider = stub({
  id: 'replicate',
  label: 'Replicate model',
  note: 'Needs REPLICATE_API_TOKEN and a model slug on the server.',
  capabilities: { colour: true, geometry: true, beard: true, upscale: true },
  docs: 'Poll the prediction endpoint and forward each status change as a progress frame.'
});

/** A self-hosted hair transfer model, for teams running their own weights. */
export const selfHostedProvider = stub({
  id: 'self-hosted',
  label: 'Self hosted model',
  note: 'Set MUSE_MODEL_URL to your inference server and implement /api/generate.',
  capabilities: { colour: true, geometry: true, beard: true, upscale: true },
  docs: 'Expect a hair-region mask alongside the portrait; return a full-resolution composite.'
});
